let normalize = require('normalize-url'),
    urlLibrary = require('url'),
    URI = require('urijs'),
    parse = require('./parse'),
    request = require('request'),
    htmlparser = require('htmlparser2'),
    parseHttpHeader = require('parse-http-header')


module.exports = {
    findRSS: findRSS
}


let feedTypes = [
    'text/xml',
    'application/xml',
    'application/rss+xml',
    'application/atom+xml',
    'application/rdf+xml'
]


function isValidRSSLink(link) {
    let wrongType = !link.type || (link.type.indexOf('rss') == -1 && link.type.indexOf('xml') == -1 && link.type.indexOf('atom') == -1)
    let isValid
    if (link.media && wrongType) {
        isValid = false
    } else {
        isValid = true
    }
    return isValid
}


function discover(options, cb) {
    let discovered = [],
        contentType = '',
        errored = false

    let req = this._request = request(options),
        parser = this._parser = new htmlparser.Stream();

    req.on('error', onEnd);
    req.on('abort', function() {
        req.removeAllListeners();
        req.destroy();
    });
    req.on('response', function(response) {
        if (response.statusCode !== 200) {
            var err = new Error(req.httpModule.STATUS_CODES[response.statusCode] || 'Unknown HTTP response');
            err.code = response.statusCode;
            return onEnd(err);
        }

        if (response.headers['content-type']) {
            contentType = parseHttpHeader(response.headers['content-type'])[0];
        }

        if (~feedTypes.indexOf(contentType)) {
            discovered.push({
                rel: 'self',
                type: contentType,
                // response.url takes into account redirects
                href: req.uri.href
            });
            req.abort();
            onEnd();
        } else {
            req.pipe(parser);
        }
    });

    parser.on('error', onEnd);
    parser.on('finish', onEnd);

    parser.on('opentag', function openHeadHandler(name) {
        if (name === 'head') {
            parser.removeListener('opentag', openHeadHandler);
            parser.on('opentag', linkHandler);
            parser.on('closetag', closeHeadHandler);
        }

        function linkHandler(name, attribs) {
            if (name === 'link' && attribs && attribs.rel && attribs.rel === 'alternate') {
                if (isValidRSSLink(attribs)) {
                    discovered.push(attribs)
                }
            }
        }

        function closeHeadHandler(name) {
            if (name === 'head') {
                parser.removeListener('opentag', linkHandler);
                parser.removeListener('closetag', closeHeadHandler);
                req.abort();
                parser._parser.pause();
                parser.end();
            }
        }
    });

    function onEnd(err) {
        if (errored) return
        if (err) {
            errored = true
            cb(err)
        } else {
            cb(null, {
                'content-type': contentType,
                'links': discovered
            })
        }
    }

    return this
}



function findRSS(humanizedUrl, callback) {

    // find the RSS feed for the given URL
    let url

    try {
        url = normalize(humanizedUrl) // e.g. translate spacex.com into http://spacex.com
    } catch (err) {
        sails.log(err)
        callback(err, null)
    }
    let options = {
        url: url,
        timeout: 10000,
        maxRedirects: 25,
        jar: true,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36',
            'accept': 'text/html,application/xhtml+xml'
        }
    }

    // handle rss discovery, modified version of:
    // https://github.com/danmactough/node-rssdiscovery/blob/master/discover.js

    discover(options, function(err, results) {

        if (err) {
            sails.log(err)
            return callback(err, null)
        }

        let links = results.links

        if (links && links.length) {

            let feedUrl = results.links[0].href

            feedUrl = new URI(feedUrl).absoluteTo(url).normalize().toString()

            parse.fetch(feedUrl, function(err, meta, articles) {
                callback(err, url, feedUrl, meta)
            })

        } else {
            return callback('No RSS feed found.', null)
        }

    })

}
