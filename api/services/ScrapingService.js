const parse     = require('./parse'),
      striptags = require('striptags'),
      moment    = require('moment'),
      async     = require('async'),
      cheerio   = require('cheerio'),
      URI       = require('urijs')

module.exports = {
    scrapeFeed: scrapeFeed,
    getMetaInformation: getMetaInformation
}

function scrapeFeed(feed, numberOfActivities, callback) {

    sails.log.info(`Now scraping feed ${feed.feedUrl}`)

    function storeArticleBound(article, callback) {
        storeArticle(feed, article, callback)
    }

    // scrape articles
    parse.fetch(feed.feedUrl, function(err, meta, articles) {

        if (err) {
            sails.log.error('parsing failed', err)
            return callback(err, null)
        }

        // loop through articles
        // https://github.com/danmactough/node-feedparser#list-of-article-properties
        sails.log.info(`Found ${articles.length} articles to insert`)

        articles = articles.slice(0, numberOfActivities)
        articles.forEach(function(article) {
            article.feedObject = feed
        })

        // iterate through articles and enrich
        async.map(articles, enrichArticle, function(err, enrichedArticles) {
            if (err) {
                sails.log.error('enrichment failed', err)
            }

            // iterate through enrichedArticles and store
            async.map(enrichedArticles, storeArticleBound, function(err, articleActivities) {
                sails.log.info(`completed scraping for feed ${feed.feedUrl} - ${feed.id} found ${articleActivities.length} activities`)
                const now = new Date()
                sails.models.feeds.update({
                    id: feed.id
                }, {
                    lastScraped: now
                }).exec(function(err, updatedFeed) {
                    if (err) {
                        sails.log.error('update failed', err)
                    }
                    sails.log.info(`updated:${updatedFeed} last scraped at to ${now}`)
                    callback(null, articleActivities)
                })
            })
        })
    })
}

function enrichArticle(article, callback) {

    const validator = require('validator')

    let url = article.link,
        feed = article.feedObject

    if (feed.feedUrl.indexOf('designernews') != -1) {
        if (validator.isURL(article.summary)) {
            url = article.summary
        } else {
            // default image for text posts
            article.image = {url: 'http://67.media.tumblr.com/5a535d0f4218df35a83525fc40bf521f/tumblr_inline_mufumquS5g1r0v0xk.png'}
        }
    }

    if (!url) {
        sails.log.warn('Received an empty URL for this article:', article)
        callback(null, null)
        return
    }


    getMetaInformation(url, function(err, meta) {

        // Don't use the article if we can't get meta information
        if (err) {
            return callback(null, null)
        }

        // Sensible defaults for dealing with broken data
        let rssImage = (article.image && article.image.url) ? article.image.url : null

        article.canonicalUrl = meta.canonicalUrl || article.link
        article.imageSrc = meta.image || rssImage
        article.category = (article.categories.length) ? article.categories : meta.keywords
        article.summary = article.summary || meta.ogDescription

        // extract image from summary if we don't have one
        if (!article.imageSrc) {
                if (article.summary) {
                    try {
                        let $ = cheerio.load(article.description)
                        let descriptionImage = $('img').attr('src')
                        article.imageSrc = makeUrlAbsolute(article.link, descriptionImage)
                    } catch (e) {
                        sails.log.warn('cheerio didnt quite work', e)
                    }
                }
        }

        // feed specific logic
        if (feed.feedUrl.indexOf('designernews') != -1) {
            article.summary = null
        } else if (feed.feedUrl.indexOf('news.ycombinator.com') != -1) {
            article.summary = meta.ogDescription
            article.description = undefined
        } else if (feed.feedUrl.indexOf('lobste.rs') != -1) {
            article.summary = meta.ogDescription
            article.description = undefined
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

        callback(null, article)

    })
}

function makeUrlAbsolute(baseUrl, url) {

    if (url && url.indexOf('http') == -1) {

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

    const MetaInspector = require('node-metainspector')
    let client

    try {
        client = new MetaInspector(articleUrl, {
            timeout: 10000,
            maxRedirects: 25,
            jar: true,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Macintosh Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36',
              'accept': 'text/html,application/xhtml+xml'
            }
        })

    } catch (e) {
        sails.log.error('bummer, cant read meta for', articleUrl)
        return callback(e)
    }



    client.on('fetch', function() {

        let canonical = this.parsedDocument("link[rel='canonical']").attr("href")
        client.ogUrl = this.parsedDocument("meta[property='og:url']").attr("content")

        let patt = /icon/i
        this.parsedDocument("link").each(function(i, elem) {
            let match = patt.test(elem.attribs.rel)
            if (match) {
                client.favicon = elem.attribs.href
                return false
            }
        })

        client.favicon = makeUrlAbsolute(articleUrl, client.favicon)

        client.canonicalUrl = canonical || client.ogUrl || this.response.url
        client.canonicalUrl = makeUrlAbsolute(articleUrl, client.canonicalUrl)

        callback(null, client)

    })

    client.on('error', function(err) {

        sails.log.error('failed to get meta', err)

        // handle corner cases where the library fails without an error
        err = err || 'failed to get meta'

        return callback(err)

    })

    client.fetch()

}

function isValidArticle(article) {

    let valid = !!article

    if (article) {

        if (!article.imageSrc) {
            valid = false
        } else if (!article.link) {
            valid = false
        }
    }
    return valid

}

function storeArticle(feedObject, rssArticle, callback) {

    if (!isValidArticle(rssArticle)) {

        // Its an example app, ignore broken data
        sails.log.error('bummer, this article is invalid', rssArticle && rssArticle.link)

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
        // uniqueness
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
        canonicalUrl: rssArticle.canonicalUrl
    }

    if (rssArticle.pubdate) {
        articleProperties.publicationDate = rssArticle.pubdate
    }

    Articles.findOrCreate({
        site: feed.site,
        or : [
          { articleUrl: rssArticle.link },
          { canonicalUrl: rssArticle.canonicalUrl }
        ]
    }, articleProperties).exec(function cb(err, article) {

        if (err) {
            sails.log.error('couldnt save article', err)
            return callback(err)
        }

        // articles have an canonicalUrl and an articleUrl
        // in theory different feeds can point to the same canonicalUrl
        // also different article urls can point to the same canonicalUrl
        Articles.update({
            id: article.id
        }, articleProperties).exec(function(err, updateArticles) {
            if (err) {
                sails.log.error('couldnt update article', err)
                return callback(err)
            }
            let article = updateArticles[0]
            sails.log.verbose(`created and updated a new article`, article)

            let activity = article.toActivity(),
                streamFeed = StreamService.client.feed('rss_feed', feed.id)

            streamFeed.addActivity(activity).then(function() {
                sails.log.verbose('added article to stream', article.articleUrl)
                callback(null, activity)
            }, function(err) {
                sails.log.error('error adding article to stream', err)
                callback(err)
                return
            })

        })

    })

}
