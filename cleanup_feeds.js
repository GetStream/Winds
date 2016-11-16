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

    let toRemove = [
        '58249683cbadf98d752eee2e',
        '58258d6943ada2fd50fe45f9',
        '581caff25632dccc09c845a6',
        '582590bcaacf5d415e955dfd',
        '581c079e523b1d7945cb32f8',
        '581cb0085632dccc09c845a9',
        '58249c40cbadf98d752ef188',
        '5825d58813f9b35764235f88',
        '5825d56913f9b35764235f5c',
        '5826856e7f93ab5549d03f55',
        '5826d19a13f7a43f65f9bcbc',
        '582696aa7f93ab5549d04442',
        '58286533ddfd7d715c34a5f9',
        '5825cbbc13f9b35764235cc5',
        '5826e0a813f7a43f65f9c1cc',
        '5824a1dccbadf98d752ef442',
        '5824a209cbadf98d752ef45e',
        '582842fd25508c8f23273073',
        '582a03089bc021a4496f9cfa',
        '582af2de05b3e6a0786cf06b',
        '582a729e5857fa1d5991fc37',
        '58296d0b532f40613c86ecdc',
        '582b1ff1ce764a8d765ffae4',
        '582c21b2741f1bdb799a0131'
    ]

    if (toRemove.length) {

        async.parallel([callback => {
            sails.models.feeds.destroy({
                id: toRemove,
            }).exec((err, results) => {
                console.log('removed feeds')
                callback(err, results)
            })
        }, callback => {
            sails.models.follows.destroy({
                feed: toRemove,
                type: 'feed'
            }).exec((err, results) => {
                console.log('removed follows')
                callback(err, results)
            })
        }], findBrokenFeeds)

    } else {
        findBrokenFeeds()
    }

    function findBrokenFeeds() {
        sails.models.feeds.find({}).exec(function(err, feeds) {

            function repairFeed(feed, callback) {
                parse.fetch(feed.feedUrl, function(err, meta, articles) {
                    if (err) {
                        console.log(`'${feed.id}',`)
                        console.log(feed.feedUrl)
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
    }


 })
