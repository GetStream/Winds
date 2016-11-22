/**
 * Tips
 * ====
 * - Set `user-agent` and `accept` headers when sending requests. Some services will not respond as expected without them.
 * - Set `pool` to false if you send lots of requests using "request" library.
 */

const zlib = require('zlib')

function fetch(feedUrl, callback) {

    const request = require('request'),
        FeedParser = require('feedparser')

    // define our streams
    let req = request(feedUrl, {
        timeout: 7000,
        pool: false,
        maxRedirects: 25,
        jar: true,
        gzip: true
    })

    req.setMaxListeners(50)
    req.setHeader('user-agent', 'Winds RSS reader')
    req.setHeader('accept', 'text/html,application/xhtml+xml')

    var feedparser = new FeedParser({
        addmeta: false,
        normalize: true,
        feedurl: feedUrl
    })

    // define our handlers
    let feedRequestError, feedResultError
    req.on('error', function(err, response) {
        feedRequestError = err
    })
    req.on('response', function(res) {
        if (res.statusCode != 200) {
            let err = new Error('Bad status code')
            // in this case we never reach the feed parser end
            // so call callback manually
            return callback(err, null, null)
        }
        let encoding = res.headers['content-encoding'] || 'identity',
            charset = getParams(res.headers['content-type'] || '').charset
        sails.log.verbose(`Feed content encoding ${encoding}, charset ${charset}`)
        res.on('error', function(err){
            feedResultError = err
        })

        res = maybeDecompress(res, encoding)
        res = maybeTranslate(res, charset)
        // And boom goes the dynamite
        res.pipe(feedparser)

    })

    let feedParseError
    feedparser.on('error', function(err, response) {
        feedParseError = err
    });


    let items = []
    feedparser.on('readable', function() {
        while (item = this.read()) {
            items.push(item)
        }
    });

    feedparser.on('end', function() {
        let err = feedRequestError || feedParseError || feedResultError
        callback(err, feedparser.meta, items);
    });

}

function maybeTranslate(res, charset) {
    const iconv = require('iconv-lite')

    // use iconv if its not utf8 already.
    if (charset && !/utf-*8/i.test(charset)) {
        try {
            res.pipe(
                iconv.decodeStream(charset)
            ).pipe(
                iconv.encodeStream('utf-8')
            )
        } catch (err) {
            res.emit('error', err);
        }
    }

    return res;

}

exports.fetch = fetch;

function maybeDecompress(res, encoding) {

    let decompress

    if (encoding.match(/\bdeflate\b/)) {
        decompress = zlib.createInflate()
    } else if (encoding.match(/\bgzip\b/)) {
        decompress = zlib.createGunzip()
    }
    let newRes = decompress ? res.pipe(decompress) : res;

    newRes.on('error', err => {
        // emit the error on the original
        res.emit('error', err)
    })
    return newRes
}

function getParams(str) {

    let params = str.split(';').reduce(function(params, param) {

        var parts = param.split('=').map(function(part) {
            return part.trim();
        });

        if (parts.length === 2) {
            params[parts[0]] = parts[1];
        }

        return params;

    }, {});

    return params;

}
