var Sails     = require('sails').Sails,
    app       = Sails(),
    striptags = require('striptags'),
    moment    = require('moment'),
    request = require('request'),
    async     = require('async'),
    cheerio   = require('cheerio')


var scrapingErrors = {}

app.load({
    hooks: { grunt: false },
    log: { level: 'warn' }
}, function sailsReady(err) {

    if (err) {
        sails.log.warn('Error loading app:', err)
        return process.exit(1)
    }

    sails.log.info('About to start sync process')

    let limit = 100

    sails.models.feeds.find({}).exec(function(err, feeds) {

        function repairFeed(feed, callback) {
            parse.fetch(feed.feedUrl, function(err, meta, articles) {

                if (err) {
                    console.log('feed is broken', feed.feedUrl)
                    // TODO: remove the feed
                    // TODO: remove all follow relationships to this feed
                }
                callback(null, feed)
            })
        }

        sails.log.info(`found ${feeds.length} feeds to repair`)
        async.mapLimit(feeds, 200, repairFeed, function(err, results) {
            sails.log.info('completed repair')
            if (err) {
                sails.log.error(err)
            } else {
                process.exit(0)
            }
        })

    })


 })
