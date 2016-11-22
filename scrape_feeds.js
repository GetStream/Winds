const Sails     = require('sails').Sails,
    app       = Sails(),
    striptags = require('striptags'),
    moment    = require('moment'),
    async     = require('async'),
    cheerio   = require('cheerio'),
    kue = require('kue')

var argv = require('yargs')
    .usage('Usage: $0 <command> [options]')
    .command('scrape_feeds', 'Scrape all RSS feeds that we didn\'t update in the past 5 minutes')
    .example('$0 -f -c 50', 'Scrape all feeds, 50 at the time')
    .example('$0 -q cnn -a 1', 'Get 1 article from CNN')
    .alias('l', 'live')
    .boolean('l')
    .default('l', false)
    .describe('l', 'keeps the process alive')
    .alias('f', 'force')
    .boolean('f')
    .default('f', false)
    .describe('f', 'scrape all feeds, not just those that aren\'t up to date')
    .alias('t', 'tasks')
    .boolean('t')
    .default('t', false)
    .describe('t', 'create tasks instead of running scraping locally')
    .alias('a', 'articles')
    .number('a')
    .default('a', 20)
    .describe('a', 'the number of articles to insert per feed')
    .alias('c', 'concurrency')
    .number('c')
    .default('c', 100)
    .describe('c', 'the number of feeds to scrape concurrently. for debugging set this to 1')
    .alias('q', 'query')
    .string('q')
    .describe('q', 'search for a feed url containing this value')
    .alias('v', 'verbosity')
    .string('v')
    .describe('v', 'set the verbosity level')
    .default('v', 'info')
    .help('h')
    .alias('h', 'help')
    .epilog('Happy reading!')
    .argv

var scrapingErrors = {}

app.load({
    hooks: { grunt: false },
    log: { level: argv.v }
}, function sailsReady(err) {

    if (err) {
        sails.log.warn('Error loading app:', err)
        return process.exit(1)
    }

    sails.log.info('About to start scraping process')

    let numberOfActivities = argv.a || 20,
        concurrency = argv.c || 10,
        createTasks = argv.t,
        forceUpdate = argv.f

    function scrapeFeedsBound(err, feeds) {
        scrapeFeeds(err, feeds, numberOfActivities, concurrency, createTasks, forceUpdate)
    }

    sails.log.info(`Going to scrape ${numberOfActivities} activities per feed`)

    if (argv.q) {
        sails.log.info(`Searching for a feed matching ${argv.q}`)
        Feeds.find({ feedUrl: {'contains': argv.q} }).exec(scrapeFeedsBound)
    } else if (argv.f) {
        sails.log.info(`Scraping all feeds`)
        Feeds.find({}).exec(scrapeFeedsBound)
    } else {
        var scrapeInterval = moment().subtract(3, 'm').toISOString()
        sails.log.info(`Scraping all feeds that are older than ${scrapeInterval}`)
        async.waterfall([
            callback=>{
                Feeds.count({lastScraped: null}).exec(function(err, results) {
                    sails.log.info(`These feeds have never been scraped`, results)
                    callback(err, results)
                })
            }, function(count, callback) {
                Feeds.count({lastScraped: {'<': scrapeInterval}}).exec(function(err, results) {
                    sails.log.info(`These feeds need to be updated`, results)
                    callback(err, results)
                })
            }, function(count, callback) {
                Feeds.count({
                        or: [
                            {
                                lastScraped: {'<': scrapeInterval}
                            },
                            {
                                lastScraped: null
                            }
                        ]
                    }).exec(function(err, results) {
                        sails.log.info(`In total these feeds need to be updated`, results)
                        callback(err, results)
                    })
            }, function(count, callback) {
                // prioritize feeds that have never been scraped
                Feeds.find({
                    or: [
                        {
                            lastScraped: {'<': scrapeInterval}
                        },
                        {
                            lastScraped: null
                        }
                    ]
                }).sort('topic DESC lastScraped ASC').exec(function(err, results) {
                    scrapeFeedsBound(err, results)
                })
            }]
        )
    }

 })

// query the feed table for feeds we need to scrape
function scrapeFeeds(err, feeds, numberOfActivities, concurrency, createTasks, forceUpdate) {

     let queue
     if (createTasks) {
         queue = kue.createQueue({ redis: sails.config.tasks.redis })
     }
     sails.log.info(`Found ${feeds.length} feeds we need to scrape`)

     if (err) sails.log.warn(err)
     if (!feeds) sails.log.verbose('No feeds to scrape.')

     function scrapeFeedBound(feed, callback) {
         if (createTasks) {
             let scrapeTask = queue.create('scrape_rss', {
                 title: `Feed ${feed.feedUrl}`,
                 feedId: feed.id,
                 feedUrl: feed.feedUrl,
                 startedAt: new Date()
             }).ttl(1000*60*10).events(false).save(function(err){
                 if (err) {
                     sails.log.error(err)
                 } else {
                     sails.log.info(`start scrape rss task ${scrapeTask.id} for feed ${feed.id}`)
                 }
                 callback(err, null)
             });
         } else {
             ScrapingService.scrapeFeed(feed, numberOfActivities, forceUpdate, function(err, response) {
                 if (err) {
                    feed.scrapingErrors = feed.scrapingErrors + 100
                 }
                 return callback(null, response)
             })
         }

     }

     // iterate through feeds
     async.mapLimit(feeds, concurrency, scrapeFeedBound, function(err, articles) {
         sails.log.info(`Completed scraping for ${feeds.length} feeds`)
         feeds.forEach(function(feed) {
             if (feed.scrapingErrors > 0) {
                 sails.log.warn(`Encountered ${feed.scrapingErrors} errors for feed`, feed.feedUrl)
             }
         })
         if (!argv.l) {
            sails.log.info('Exiting... bye bye')
            process.exit(0)
         }
     })

}
