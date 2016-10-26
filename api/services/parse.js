/**
 * Tips
 * ====
 * - Set `user-agent` and `accept` headers when sending requests. Some services will not respond as expected without them.
 * - Set `pool` to false if you send lots of requests using "request" library.
 */



function fetch(feedUrl, callback) {

    const request = require('request'),
        FeedParser = require('feedparser'),
        iconv = require('iconv-lite')

    // define our streams
    let req = request(feedUrl, {
        timeout: 10000,
        pool: false,
        maxRedirects: 25,
        jar: true
    });

    req.setMaxListeners(50);

    var feedparser = new FeedParser({
        addmeta: false,
        normalize: true,
        feedurl: feedUrl
    });

    // define our handlers
    req.on('error', callback);
    req.on('response', function(res) {
        if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'));
        let charset = getParams(res.headers['content-type'] || '').charset;
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
