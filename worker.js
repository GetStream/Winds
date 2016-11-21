const Sails     = require('sails').Sails,
    app       = Sails(),
    striptags = require('striptags'),
    moment    = require('moment'),
    async     = require('async'),
    cheerio   = require('cheerio'),
    kue       = require('kue');

var argv = require('yargs')
    .usage('Usage: $0 <command> [options]')
    .command('worker', 'Run a simple background worker')
    .example('$0 -f -c 50', 'Scrape all feeds, 50 at the time')
    .example('$0 -q cnn -a 1', 'Get 1 article from CNN')
    .alias('v', 'verbosity')
    .string('v')
    .describe('v', 'set the verbosity level')
    .default('v', 'info')
    .help('h')
    .alias('h', 'help')
    .epilog('Happy reading!')
    .argv

app.load({
    hooks: { grunt: false },
    log: { level: argv.v }
}, function sailsReady(err) {

    if (err) {
        sails.log.warn('Error loading app:', err)
        return process.exit(1)
    }

    sails.log.info('connecting to broker...')
    let queue = kue.createQueue({redis: sails.config.tasks.redis})
    sails.log.info('Started RSS scraping worker, yeah!')

    queue.process('scrape_rss', 20, function(job, done){
      scrapeFeedTask(job.data.feedId, job.data.startedAt, done);
    });

    function scrapeFeedTask(feedId, startedAt, done) {
        let tenMinutesAgo = moment().subtract(10, 'm');
        if (startedAt < tenMinutesAgo) {
            sails.log.warn(`feedId ${feedId} task started more than 10 minutes ago, skipping it`)
            done()
        }
        sails.log.info(`looking up feed with id ${feedId}`)
        sails.models.feeds.findOne({id: feedId}).exec(function(err, feed) {
            if (err) {
                sails.log.error('error retrieving feed', err)
            }
            ScrapingService.scrapeFeed(feed, 20, function(err, response) {
                sails.log.info(`completed scraping for feed ${feed.id}, url ${feed.feedUrl}`)
                if (feed.scrapingErrors) {
                    sails.log.warn(`encountered ${feed.scrapingErrors} for feed ${feed.id}, url ${feed.feedUrl}`)
                }
                return done()
            })
        })
    }

})
