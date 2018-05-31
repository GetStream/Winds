import events from '../utils/events';
import async from 'async';
import isUrl from 'url-regex';
import opmlParser from 'node-opml-parser';
import opmlGenerator from 'opml-generator';
import moment from 'moment';
import entities from 'entities';
import normalizeUrl from 'normalize-url';
import stream from 'getstream';
import search from '../utils/search';

import RSS from '../models/rss';
import Follow from '../models/follow';
import User from '../models/user';


import config from '../config';
import logger from '../utils/logger';

const client = stream.connect(config.stream.apiKey, config.stream.apiSecret);

// TODO:
// - refactor using async
// - detect podcast vs rss
// - test coverage

exports.get = async (req, res) => {
	let userID = req.user.sub;
  let follows = await Follow.find({ user: userID })
  console.log('start', userID);

  let user = await User.find({ userID })

	let header = {
		dateCreated: moment().toISOString(),
		ownerName: user.name,
		title: `Subscriptions in Winds - Powered by ${config.product.author}`,
	};

  console.log('follows', follows)

	let outlines = follows.map(follow => {
		let feed = follow.rss ? follow.rss : follow.podcast;
		let feedType = follow.rss ? 'rss' : 'podcast';
		let obj = {
			htmlUrl: feed.url,
			title: feed.title,
			type: feedType,
			xmlUrl: feed.feedUrl,
		};
		return obj;
	});
	let opml = opmlGenerator(header, outlines);

	res.set({
		'Content-Disposition': 'attachment; filename=export.opml;',
		'Content-Type': 'application/xml',
	});

	res.end(opml);
};

exports.post = async (req, res) => {
	/*
    const upload = Buffer.from(req.file.buffer).toString("utf8")
    const data = Object.assign({}, req.body, { user: req.user.sub }) || {}

    if (!upload) {
        return res.sendStatus(422)
    }

    let feeds = await utils.promisify(opmlParser)(upload)
    let parsedFeeds = feeds.map(feed => {
        let url = feed.url || ""
        let feedUrl = feed.feedUrl || ""

        if (isUrl().test(url)) {
            url = normalizeUrl(url)
        }

        if (isUrl().test(feedUrl)) {
            feedUrl = normalizeUrl(feedUrl)
        }

        let favicon = ""
        if (feeds.site && feeds.site.favicon) {
            favicon = feeds.site.favicon
        }
        return feed
    }

    // find or update the RSS feeds specified in the OPML
    let promises = []
    for (let feed of parsedFeeds) {
      let data = {
          categories: "RSS",
          description: entities.decodeHTML(feed.title),
          favicon: favicon,
          feedUrl: feedUrl,
          lastScraped: moment().subtract(12, "hours"),
          public: true,
          publicationDate: moment().toISOString(),
          title: entities.decodeHTML(feed.title),
          url: url,
      }
    }

    opmlParser(upload, (err, feeds) => {

        Promise.all(
            feeds.map(feed => {

                // first, check to see if there's an RSS feed with the same feedURL
                return RSS.findOne({ feedUrl })
                    .then(rss => {
                        if (!rss) {
                            // if not, create it, add it to stream personalization, add it to algolia, and pass it down the promise chain
                            return RSS.create({
                                categories: "RSS",
                                description: entities.decodeHTML(feed.title),
                                favicon: favicon,
                                feedUrl: feedUrl,
                                lastScraped: moment().subtract(12, "hours"),
                                public: true,
                                publicationDate: moment().toISOString(),
                                title: entities.decodeHTML(feed.title),
                                url: url,
                            }).then(newRss => {
                                return Promise.all([
                                    search({
                                        _id: newRss._id,
                                        categories: "RSS",
                                        description: newRss.title,
                                        image: newRss.favicon,
                                        public: true,
                                        publicationDate: newRss.publicationDate,
                                        title: newRss.title,
                                        type: "rss",
                                    }),
                                    events({
                                        meta: {
                                            data: {
                                                [`rss:${newRss._id}`]: {
                                                    description: newRss.description,
                                                    title: newRss.title,
                                                },
                                            },
                                        },
                                    }),
                                ]).then(() => {
                                    // pass the newly created rss feed (NOT the results from algolia / personalization) down the promise chain
                                    return newRss
                                })
                            })
                        } else {
                            // if so, update it, pass the updated version down the promise chain
                            return RSS.findByIdAndUpdate(
                                rss._id,
                                {
                                    $set: {
                                        categories: "RSS",
                                        description: entities.decodeHTML(feed.title),
                                        favicon: favicon,
                                        feedUrl: feedUrl,
                                        lastScraped: moment().subtract(12, "hours"),
                                        public: true,
                                        publicationDate: moment().toISOString(),
                                        title: entities.decodeHTML(feed.title),
                                        url: url,
                                    },
                                },
                                {
                                    new: true,
                                    upsert: true,
                                },
                            )
                        }
                    })
                    .then(rss => {
                        // TODO: switch this over to use the "shared" js

                        // then, regardless of if it was created or not, create the follow in mongodb, set the timeline and user_article feeds to follow in stream
                        return Promise.all([
                            Follow.create({
                                rss: rss._id,
                                user: req.user.sub,
                            }),
                            client.feed("user_article", data.user).follow("rss", rss._id),
                            client.feed("timeline", data.user).follow("rss", rss._id),
                        ]).then(() => {
                            return rss
                        })
                    })
            }),
        )
            .then(results => {
                res.json(results)
            })
            .catch(err => {
                res.status(500).send(err.message)
            })
    })*/
};
