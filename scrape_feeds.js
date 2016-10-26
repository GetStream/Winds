var Sails     = require('sails').Sails,
    app       = Sails(),
    striptags = require('striptags'),
    moment    = require('moment'),
    async     = require("async"),
    cheerio   = require('cheerio');


var argv = require('yargs')
    .usage('Usage: $0 <command> [options]')
    .command('scrape_feeds', 'Scrape all RSS feeds that we didn\'t update in the past 5 minutes')
    .example('$0 -f -c 50', 'Scrape all feeds, 50 at the time')
    .example('$0 -q cnn -a 1', 'Get 1 article from CNN')
    .alias('f', 'force')
    .boolean('f')
    .default('f', false)
    .describe('f', 'scrape all feeds, not just those that aren\'t up to date')
    .alias('a', 'articles')
    .number('a')
    .default('a', 20)
    .describe('a', 'the number of articles to insert per feed')
    .alias('c', 'concurrency')
    .number('c')
    .default('c', 30)
    .describe('c', 'the number of feeds to scrape concurrently. for debugging set this to 1')
    .alias('q', 'query')
    .string('q')
    .describe('q', 'search for a feed url containing this value')
    .help('h')
    .alias('h', 'help')
    .epilog('Happy reading!')
    .argv;

var scrapingErrors = {}

app.load({
    hooks: { grunt: false },
    log: { level: 'info' }
}, function sailsReady(err) {

    if (err) {
        sails.log.warn('Error loading app:', err);
        return process.exit(1);
    }

    sails.log.info('About to start scraping process')

    var numberOfActivities = argv.a || 20
    var concurrency = argv.c || 10
    function scrapeFeedsBound(err, feeds) {
        scrapeFeeds(err, feeds, numberOfActivities, concurrency)
    }
    sails.log.info(`going to scrape ${numberOfActivities} activities per feed`)

    if (argv.q) {
        sails.log.info(`searching for a feed matching ${argv.q}`)
        Feeds.find({ feedUrl: {'contains': argv.q} }).exec(scrapeFeedsBound);
    } else if (argv.f) {
        sails.log.info(`scraping all feeds`)
        Feeds.find({}).exec(scrapeFeedsBound);
    } else {
        var scrapeInterval = moment().subtract('minutes', 3).toISOString();
        sails.log.info(`scraping all feeds that are older than ${scrapeInterval}`)
        Feeds.find({
            where: {
                lastScraped: {
                    '<': scrapeInterval }
                },
                or: [{
                    lastScraped: {
                        '=': null
                    }
                }]
            }).exec(scrapeFeedsBound);
    }
 });

// query the feed table for feeds we need to scrape
function scrapeFeeds(err, feeds, numberOfActivities, concurrency) {
     sails.log.info(`Found ${feeds.length} feeds we need to scrape`)

     if (err) sails.log.warn(err)
     if (!feeds) sails.log.verbose('No feeds to scrape.')

     function scrapeFeedBound(feed, callback) {
         ScrapingService.scrapeFeed(feed, numberOfActivities, function(err, response) {
             if (err) {
                 sails.log.error('encountered a critical error while scraping', feed.feedUrl)
                 feed.scrapingErrors = feed.scrapingErrors + 100
             }
             // never break the scraping loop, dont propagate errors
             return callback(null, response)
         })
     }

     // iterate through feeds
     async.mapLimit(feeds, concurrency, scrapeFeedBound, function(err, articles) {
         if (err) {
             sails.log.error('scraping feed failed', err)
         }
         sails.log.info(`completed scraping for ${feeds.length} feeds`)
         feeds.forEach(function(feed) {
             if (feed.scrapingErrors > 0) {
                 sails.log.warn(`encountered ${feed.scrapingErrors} errors for feed`, feed.feedUrl)
             }
         })
         sails.log.info('exiting... bye bye')
         process.exit()
     });
}
