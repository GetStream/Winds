let rssDiscover = require('rssdiscovery'),
    normalize   = require('normalize-url'),
    urlLibrary  = require('url'),
    URI         = require('urijs'),
    parse       = require('./parse')

module.exports = {
    findRSS: findRSS
}

function validateRSSLinks(links) {

    let validLinks = []

    links.forEach(link => {

        sails.log('REL: ' + link.rel)

        let wrongType = !link.type || (link.type.indexOf('rss') == -1 && link.type.indexOf('xml') == -1 && link.type.indexOf('atom') == -1)

        if (link.media && wrongType) {
            return callback('No RSS feed found.', null)
        } else {
            validLinks.push(link)
        }

    })

    return validLinks

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

    rssDiscover({
        url: url,
        timeout: 10000,
        maxRedirects: 25,
        jar: true,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36',
          'accept': 'text/html,application/xhtml+xml'
        }
    }, function(err, results) {

        if (err) {
            sails.log(err)
            return callback(err, null)
        }

        let links = []
        if (results && results.links) {
            links = validateRSSLinks(results.links)
        }

        if (links && links.length) {

            let feedUrl = results.links[0].href
                feedUrl = new URI(feedUrl).absoluteTo(url).normalize().toString()

            parse.fetch(feedUrl, function(err, meta, articles) {
                callback(null, url, feedUrl, meta)
            })

        } else {
            return callback('No RSS feed found.', null)
        }

    })

}
