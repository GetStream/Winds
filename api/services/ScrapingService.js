const parse     = require('./parse'),
      striptags = require('striptags'),
      moment    = require('moment'),
      async     = require('async'),
      cheerio   = require('cheerio'),
      request   = require('request'),
      URI       = require('urijs'),
      clone     = require('clone'),
      hash      = require('object-hash')

module.exports = {
    scrapeFeed: scrapeFeed,
    getMetaInformation: getMetaInformation
}

function scrapeFeed(feed, numberOfActivities, forceUpdate, callback) {

    sails.log.info(`Now scraping feed ${feed.feedUrl}, numberOfActivities: ${numberOfActivities}, forceUpdate: ${forceUpdate} `)

    function storeArticleBound(article, callback) {
        storeArticle(feed, article, callback)
    }

    async.waterfall([
        callback => {
            // make sure we get the last 30 hashes
            sails.models.articles.find({where: {feed: feed.id}, limit: 30, sort: 'publicationDate DESC'}).exec(function(err, articles){
                let existingHashes = {}
                articles.forEach(article => {
                    if (article.hash) {
                        existingHashes[article.hash] = true
                    }
                })
                return callback(err, existingHashes)
            })
        }, (existingHashes, callback) => {
            // Scrape articles
            parse.fetch(feed.feedUrl, function(err, meta, articles) {

                if (err) {
                    return callback(err, null)
                }

                // Loop through articles
                // https://github.com/danmactough/node-feedparser#list-of-article-properties
                sails.log.info(`Found ${articles.length} articles to insert`)

                articles = articles.slice(0, numberOfActivities)
                articles.forEach(function(article) {
                    // add the hash, has to be the first thing before we modify
                    article.hash = hash.MD5(article)
                    article.feedObject = feed

                })

                // skip existing articles unless forceUpdate is set
                // since article enrichment is heavy this makes the entire scraping process much faster
                let newArticles = []
                articles.forEach(function(article) {
                    if (forceUpdate || !(article.hash in existingHashes)) {
                        newArticles.push(article)
                    } else {
                        sails.log.info(`skipping article ${article.link} with hash ${article.hash}`)
                    }
                })
                sails.log.info(`From those ${articles.length} articles, ${newArticles.length} are new`)

                // iterate through articles and enrich
                async.map(newArticles, enrichArticle, function(err, enrichedArticles) {

                    // iterate through enrichedArticles and store
                    async.map(enrichedArticles, storeArticleBound, function(err, articleActivities) {

                        sails.log.info(`Completed scraping for feed ${feed.feedUrl} - ${feed.id} found ${articleActivities.length} activities`)

                        const now = new Date()
                        sails.models.feeds.update({
                            id: feed.id
                        }, {
                            lastScraped: now
                        }).exec(function(err, updatedFeed) {

                            sails.log.info(`updated:${updatedFeed} last scraped at to ${now}`)
                            return callback(null, articleActivities)

                        })

                    })
                })
            })
        }], callback)



}

function enrichArticle(article, callback) {

    const validator = require('validator')

    let url  = article.link,
        feed = article.feedObject

    if (feed.feedUrl.indexOf('designernews') != -1) {

        if (validator.isURL(article.summary)) {
            url = article.summary
        } else {
            // Default image for text posts
            article.image = {
                url: 'http://67.media.tumblr.com/5a535d0f4218df35a83525fc40bf521f/tumblr_inline_mufumquS5g1r0v0xk.png'
            }
        }

    }

    if (!url) {
        sails.log.warn('Received an empty URL for this article:', article)
        return callback(null, null)
    }

    getMetaInformation(url, function(err, meta) {

        // Don't use the article if we can't get meta information
        if (err) {
            sails.log.warn('failed to get meta')
            return callback(null, null)
        }

        // Sensible defaults for dealing with broken data
        let rssImage = (article.image && article.image.url) ? article.image.url : null

        article.canonicalUrl = meta.canonicalUrl || article.link
        article.imageSrc     = meta.image || rssImage
        article.category     = (article.categories.length) ? article.categories : meta.keywords
        article.summary      = article.summary || meta.ogDescription

        // extract image from summary if we don't have one
        if (!article.imageSrc) {

            if (article.summary) {

                try {

                    let $ = cheerio.load(article.description),
                        img = $('img')

                    let descriptionImage = img.attr('src'),
                                   width = img.attr('width'),
                                  height = img.attr('height')

                    if ((width && width.replace('px', '') == '1') || (height && height.replace('px', '') == 1)) {
                        sails.log.info('Found an invalid image')
                    } else {
                        article.imageSrc = makeUrlAbsolute(article.link, descriptionImage)
                    }

                } catch (e) {
                    sails.log.warn(e)
                }

            }

        }
        // feed specific logic
        if (feed.feedUrl.indexOf('designernews.co') != -1) {

            if (article.description.indexOf('http') == 0) {
                article.secondaryUrl = article.link
                article.link = article.description
                // these 2 just contain the link
                article.summary = null
                article.description = null
            } else {
                // original content on designernews
                // summary and description are identical, no need for changes
                article.description = null
            }
        } else if (feed.feedUrl.indexOf('news.ycombinator.com') != -1) {
            article.summary = meta.ogDescription
            article.description = undefined
            article.secondaryUrl = article.comments
        } else if (feed.feedUrl.indexOf('hnrss.org') != -1) {
            //console.log(article)

        } else if (feed.feedUrl.indexOf('reddit') != -1) {
            // Reddit doesn't provide the target url so we cant show nice secondary actions
        } else if (feed.feedUrl.indexOf('producthunt') != -1) {
            // The meta scraping fails for PH, seems like an issue with the DOM structure
        } else if (feed.feedUrl.indexOf('lobste.rs') != -1) {
            article.summary = meta.ogDescription
            article.description = undefined
            article.secondaryUrl = article.comments

        } else if (feed.feedUrl.indexOf('gamespot.com') != -1) {
            // summary is the full text on this feed, remove it
            article.summary = meta.ogDescription
        } else if (feed.feedUrl.indexOf('FeldThoughts') != -1) {
            article.imageSrc = article.imageSrc || 'https://i.ytimg.com/vi/B9y0Pa06XSw/maxresdefault.jpg'
        } else if (feed.feedUrl.indexOf('blog.ycombinator') != -1) {
            article.imageSrc = article.imageSrc || 'https://d3atbsy0flqavg.cloudfront.net/v1.13.3/site/uri/y-combinator.silk.co/file/id/b116be60-dabe-4866-a426-99fffecc4942/'
        } else if (feed.feedUrl.indexOf('uploadvr') != -1) {
            article.summary = meta.ogDescription
            article.description = null
        }

        sails.log.verbose('=====article=====')
        sails.log.verbose(article)

        return callback(null, article)

    })
}

function makeUrlAbsolute(baseUrl, url) {

    if (url && (url.indexOf('http') === -1)) {

        let uri = new URI(url)
        try {
            url = uri.absoluteTo(baseUrl).toString()
        } catch(e) {
            url = undefined
        }
    }

    return url

}

function getMetaInformation(articleUrl, callback) {

    function absolute(url) {
        return makeUrlAbsolute(articleUrl, url)
    }

    let options = {
        uri: articleUrl,
        timeout: 7000,
        maxRedirects: 25,
        jar: true,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36',
          'accept': 'text/html,application/xhtml+xml'
        }
    }

    request(options, function(err, response, body) {

        if (err || response.statusCode != 200) {

            sails.log.warn(err)

            // handle corner cases where the library fails without an error
            err = err || 'failed to get meta'

            return callback(err)

        } else {

            let meta = {},
                parsedDocument

            try {

                parsedDocument = cheerio.load(body)

                // image
                meta.image = absolute(parsedDocument("meta[property='og:image']").attr("content"))
                // keywords
                let keywordsString = parsedDocument("meta[name='keywords']").attr("content");
                if(keywordsString) {
                    meta.keywords = keywordsString.split(',')
                } else {
                    meta.keywords = []
                }
                // ogDescription
                meta.ogDescription = parsedDocument("meta[property='og:description']").attr("content")

                // favicon detection
                let patt = /icon/i
                parsedDocument("link").each(function(i, elem) {
                    let match = patt.test(elem.attribs.rel)
                    if (match) {
                        meta.favicon = elem.attribs.href
                        return false
                    }
                })

                meta.favicon      = absolute(meta.favicon)
                meta.canonical    = parsedDocument("link[rel='canonical']").attr("href")
                meta.ogUrl        = parsedDocument("meta[property='og:url']").attr("content")
                meta.canonicalUrl = meta.canonical || meta.ogUrl || response.url
                meta.canonicalUrl = absolute(meta.canonicalUrl)

                sails.log.verbose('Found meta for URL', articleUrl, meta)

                return callback(null, meta)

            } catch(e) {
                // common errors include exceeding the max call stack
                return callback(e)
            }

        }
    })

}

function isValidArticle(article) {

    let valid = !!article

    if (article) {

        if (!article.link) {
            valid = false
        }
    }
    return valid

}

function articleChanged(first, second) {
    let a = clone(first),
        b = clone(second)
        fields = ['updatedAt', 'publicationDate']
    fields.forEach(field => {
        a[field] = 'articleChanged'
        b[field] = 'articleChanged'
    })
    //var diff = require('deep-diff').diff;
    //var differences = diff(a, b);
    //console.log(differences)
    return !_.isEqual(a, b)
}

function storeArticle(feedObject, rssArticle, callback) {

    if (!isValidArticle(rssArticle)) {

        // Its an example app, ignore broken data
        sails.log.error('Bummer, this article is invalid:', rssArticle && rssArticle.link)

        let feedUrl = feedObject.feedUrl

        if (!(feedObject.scrapingErrors)) {
            feedObject.scrapingErrors = 0
        }

        ++feedObject.scrapingErrors

        return callback(null, null)

    }

    // create the feed in the database and sync to Stream
    // store feed items in article table
    // https://github.com/danmactough/node-feedparser#list-of-article-properties
    let feed = rssArticle.feedObject

    let articleProperties = {
        // Uniqueness
        articleUrl: rssArticle.link,
        // Fields to know where the article came from
        feed: feed.id,
        site: feed.site,
        topic: feed.topic,
        // Fields related to displaying the article
        title: rssArticle.title,
        summary: striptags(rssArticle.summary).replace(/\r?\n|\r/g, ''),
        description: rssArticle.description,
        author: rssArticle.author,
        imageSrc: rssArticle.imageSrc,
        categories: rssArticle.categories,
        canonicalUrl: rssArticle.canonicalUrl,
        hash: rssArticle.hash,
        secondaryUrl: rssArticle.secondaryUrl,
    }

    if (rssArticle.pubdate) {
        articleProperties.publicationDate = rssArticle.pubdate
    }

    Articles.findOrCreate({
        feed: feed.id,
        or : [
          { articleUrl: rssArticle.link },
          { canonicalUrl: rssArticle.canonicalUrl }
        ]
    }, articleProperties).exec(function cb(err, article) {

        if (err) {
            sails.log.warn(err)
            return callback(err)
        }
        let previousArticle = article

        // articles have an canonicalUrl and an articleUrl
        // in theory different feeds can point to the same canonicalUrl
        // also different article urls can point to the same canonicalUrl
        Articles.update({
            id: article.id
        }, articleProperties).exec(function(err, updateArticles) {

            if (err) {
                sails.log.warn(err)
                return callback(err)
            }
            let article = updateArticles[0]
            let changed = articleChanged(previousArticle, article)

            sails.log.verbose(`Created and updated a new article`, article, changed)

            let activity   = article.toActivity(),
                streamFeed = StreamService.client.feed('rss_feed', feed.id)

            // only sync to Stream if its a new activity
            if (article.syncedAt && !changed) {
                sails.log.verbose('no need to sync to stream', article.syncedAt, changed)
                return callback(null, activity)
            } else {
                sails.log.verbose('starting sync to stream')
            }

            streamFeed.addActivity(activity).then(function() {
                sails.log.verbose('Added article to stream', article.articleUrl)
                const now = new Date()
                // set the synced at for the article
                Articles.update({
                    id: article.id
                }, {
                    syncedAt: now
                }).exec(function(err, updatedArticles){
                    if (err) {
                        sails.log.warn(err)
                        return callback(err)
                    } else {
                        return callback(null, activity)
                    }
                })


            }, function(err) {
                sails.log.warn(err)
                return callback(err)
            })

        })

    })

}
