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
    log: { level: 'info' }
}, function sailsReady(err) {

    if (err) {
        sails.log.warn('Error loading app:', err)
        return process.exit(1)
    }

    sails.log.info('About to start sync process')

    let limit = 100

    sails.models.follows.count({type: 'feed'}).exec(function(err, totalFollows) {
        let times = Math.ceil(totalFollows/limit)
        // sync the follows
        function syncFollowBatch(n, callback) {

            let offset = n * limit
            sails.log.info(`iteration ${n}, offset ${offset}`)

            sails.models.follows.find({where: {type: 'feed'}, skip: offset, limit:limit, sort: 'createdAt DESC'}).exec(function(err, results) {
                if (err) {
                    sails.log.error(err)
                } else {
                    offset = offset + limit
                    let batchFollow = []
                    results.forEach(follow => {
                        batchFollow.push({
                            source: `timeline:${follow.user}`,
                            target: `rss_feed:${follow.feed}`
                        })

                    })
                    if (batchFollow.length) {
                        StreamService.client.followMany(batchFollow).then(response => {
                            sails.log.info(`iteration ${n} synced ${batchFollow.length} follows to stream`)
                            callback(null, response)
                        }).catch(err => {
                            callback(err)
                        })
                    }
                }
            })
        }
        sails.log.info(`found ${totalFollows} follows, will sync to stream in ${times} API calls`)
        async.timesLimit(times, 5, syncFollowBatch, function(err, results) {
            sails.log.info('completed sync')
            if (err) {
                sails.log.error(err)
            } else {
                process.exit(0)
            }
        })
        console.log('end')

    })


 })
