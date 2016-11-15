/**
 * Tips
 * ====
 * - Set `user-agent` and `accept` headers when sending requests. Some services will not respond as expected without them.
 * - Set `pool` to false if you send lots of requests using "request" library.
 */



function fetch(feedUrl, callback) {

    const request = require('request'),
        FeedParser = require('feedparser')

    // define our streams
    let req = request(feedUrl, {
        timeout: 10000,
        pool: false,
        maxRedirects: 25,
        jar: true,
        gzip: true
    })

    req.setMaxListeners(50)
    req.setHeader('user-agent', 'winds rss reader')
    req.setHeader('accept', 'text/html,application/xhtml+xml')

    var feedparser = new FeedParser({
        addmeta: false,
        normalize: true,
        feedurl: feedUrl
    })

    // define our handlers
    req.on('error', callback);
    req.on('response', function(res) {
        if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'));
        let encoding = res.headers['content-encoding'] || 'identity',
            charset = getParams(res.headers['content-type'] || '').charset
        sails.log.info(`Feed content encoding ${encoding}, charset ${charset}`)
        res = maybeDecompress(res, encoding)
        res = maybeTranslate(res, charset)
        // And boom goes the dynamite
        res.pipe(feedparser)
    });

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
        callback(feedParseError, feedparser.meta, items);
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
    const zlib = require('zlib')
    var decompress;
    if (encoding.match(/\bdeflate\b/)) {
        decompress = zlib.createInflate();
    } else if (encoding.match(/\bgzip\b/)) {
        decompress = zlib.createGunzip();
    }
    return decompress ? res.pipe(decompress) : res;
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
