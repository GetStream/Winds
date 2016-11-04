var Sails     = require('sails').Sails,
    app       = Sails(),
    striptags = require('striptags'),
    moment    = require('moment'),
    request = require('request'),
    async     = require('async'),
    cheerio   = require('cheerio')

var argv = require('yargs')
    .usage('Usage: $0 <command> [options]')
    .command('scrape_favicons', 'Scrape the favicons for every site')
    .example('$0 ', 'Refresh all favicons')
    .example('$0 -q cnn', 'Refresh the favicon for CNN')
    .alias('c', 'concurrency')
    .number('c')
    .default('c', 30)
    .describe('c', 'the number of feeds to scrape concurrently. for debugging set this to 1')
    .alias('l', 'live')
    .boolean('l')
    .default('l', false)
    .describe('l', 'keeps the process alive')
    .alias('f', 'force')
    .boolean('f')
    .default('f', false)
    .describe('f', 'scrape all sites, not just those without a favicon')
    .alias('q', 'query')
    .string('q')
    .describe('q', 'search for a feed url containing this value')
    .help('h')
    .alias('h', 'help')
    .epilog('Happy reading!')
    .argv

var scrapingErrors = {}

app.load({
    hooks: { grunt: false },
    log: { level: 'info' }
}, function sailsReady(err) {

    if (err) {
        sails.log.warn('Error loading app:', err)
        return process.exit(1)
    }

    sails.log.info('About to start scraping process')

    if (argv.q) {
        sails.log.info(`searching for a site matching ${argv.q}`)
        Sites.find({ siteUrl: {'contains': argv.q} }).exec(scrapeFavicons)
    } else if (argv.f) {
        sails.log.info(`scraping all sites`)
        Sites.find({}).limit(1000).exec(scrapeFavicons)
    } else {
        let scrapeInterval = moment().subtract('minutes', 60 * 24).toISOString()
        sails.log.info(`scraping site we didnt update in a day`)
        Sites.find({
            or: [
                {
                    lastScraped: {'<': scrapeInterval}
                },
                {
                    lastScraped: null
                }
            ]
        }).limit(1000).exec(scrapeFavicons)
    }
 })

function scrapeFavicon(site, callback) {

    let normalize   = require('normalize-url')
    let url = normalize(site.siteUrl)

    sails.log.info('processing site', url, site.id)

    ScrapingService.getMetaInformation(url, function(err, client) {

        if (err) {
            callback(null, null)
            return
        }

        function maybeUpdateFavicon(client) {

            if (client.favicon) {
                sails.log.info('found favicon', client.favicon)
            } else {
                sails.log.error('favicon not found', client.favicon)
            }

            const now = new Date()
            sails.models.sites.update({id: site.id}, {'faviconUrl': client.favicon, lastScraped: now}).exec(function(err, result) {

                if (err) {
                    callback(err)
                    return
                }

                if (client.favicon == site.faviconUrl) {
                    sails.log.info('favicon for site didnt change', site.siteUrl)
                } else {
                    sails.log.info('updated favicon for site', site.siteUrl)
                }

                callback(null, site)

            })
        }

        if (client.favicon) {

            request(client.favicon, function (error, response, body) {

              if (error || response.statusCode != 200) {
                sails.log.info('couldnt find the favicon specified at', client.favicon)
                client.favicon = undefined
              }

              maybeUpdateFavicon(client)

            })

        } else {
            maybeUpdateFavicon(client)
        }

    })

}

// query the feed table for feeds we need to scrape
function scrapeFavicons(err, sites) {

     sails.log.info(`Found ${sites.length} sites we need to scrape`)

     if (err) sails.log.warn(err)
     if (!sites) sails.log.verbose('No feeds to scrape.')

     async.mapLimit(sites, argv.c, scrapeFavicon, function(err, articles){

         if (err) {
             sails.log.error('scraping sites failed', err)
         }

         sails.log.info(`Completed scraping for ${sites.length} sites`)

         if (!argv.l) {
            sails.log.info('Exiting... bye bye')
            process.exit(0)
         }

     })

}
