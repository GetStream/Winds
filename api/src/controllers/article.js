import mapLimit from 'async/mapLimit';
import moment from 'moment';
import promisify from 'util';

import Article from '../models/article';
import User from '../models/user';
import Like from '../models/like';
import Cache from '../models/cache';

import config from '../config';

import logger from '../utils/logger';
import parser from '../utils/parser';
import events from '../utils/events';
import search from '../utils/search';
import personalization from '../utils/personalization';

exports.list = async (req, res, _) => {
    const query = req.query || {};

    const markLiked = async (article, user, target) => {
        const like = await Like.findOne({ article, user }).lean()

        target = target.toObject();
        target.liked = !!like;

        return target;
    }

    if (query.type !== 'recommended') {
        try {
            const articles = await Article.apiQuery(req.query)
            const results = await promisify(async.mapLimit(articles, articles.length, async (article) => {
                return await markLiked(article._id, req.user.sub, article)
            }));

            return res.json(results.filter(result => result.valid));
        } catch(err) {
            logger.error(err);
            return res.status(422).send(err.errors);
        }
    }

    try {
        const data = await personalization({
            endpoint: '/winds_article_recommendations',
            userId: req.user.sub,
        })
        try {
            const results = await promisify(mapLimit(data, data.length, async (article) => {
                let enriched = await Article.findOne({ _id: article })
                if (!enriched) {
                    return null;
                }

                return await markLiked(enriched._id, req.user.sub, enriched)
            }));

            res.json(results.filter(val => !!val));
        } catch(err) {
            logger.error(err);
            res.sendStatus(422);
        }
    } catch(err) {
        res.status(503).send(err);
    }
};

exports.get = async (req, res, _) => {
    if (req.params.articleId === 'undefined') {
        return res.sendStatus(404);
    }

    let query = req.query || {};
    try {
        const article = await Article.findById(req.params.articleId)
        if (!article) {
            return res.sendStatus(404);
        }
        const user = await User.findById(req.user.sub)
        if (!user) {
            return res.sendStatus(404);
        }
        await events({
            email: user.email.toLowerCase(),
            engagement: {
                content: {
                    foreign_id: `articles:${article._id}`,
                },
                label: query.type === 'parsed' ? 'parse' : 'view',
            },
            user: user._id,
        })
    } catch(err) {
        logger.error(err);
        return res.status(422).send(err.errors);
    }

    if (query.type !== 'parsed') {
        return res.json(article)
    }

    try {
        const cached = await Cache.findOne({ url: article.url })
        if (cached) {
            return res.json(cached);
        }
        try {
            const parsed = await parser({ url: article.url })
            let content = parsed.content;
            // XKCD doesn't like Mercury
            if (article.url.indexOf('https://xkcd') == 0) {
                content = article.content;
            }

            await Cache.create({
                content: content,
                excerpt: parsed.excerpt,
                image: parsed.lead_image_url || '',
                publicationDate:
                    parsed.date_published || moment().toDate(),
                title: parsed.title,
                url: article.url,
                commentUrl: article.commentUrl,
            })
            res.json(parsed)
        } catch(err) {
            const article = await Article.findById(article._id)
            article.valid = false;
            await promisify(article.save)

            logger.error(err);
            res.status(422).send(err.errors);
        }
    } catch(err) {
        logger.error(err);
        res.sendStatus(503);
    }
};
