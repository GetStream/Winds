import md5 from 'md5';
import jwt from 'jsonwebtoken';
import stream from 'getstream';
import uuidv4 from 'uuid/v4';
import validator from 'validator';

import User from '../models/user';
import Podcast from '../models/podcast';
import RSS from '../models/rss';

import logger from '../utils/logger';
import events from '../utils/events';
import config from '../config';

import followRssFeed from '../shared/followRssFeed';
import followPodcast from '../shared/followPodcast';

const client = stream.connect(config.stream.apiKey, config.stream.apiSecret);

async function followInterest(userId, interest) {
    const interestRssFeeds = await RSS.find(interest);
    await Promise.all(interestRssFeeds.map(interestRssFeed => {
        return followRssFeed(userId, interestRssFeed._id);
    }));

    const interestPodcasts = await Podcast.find(interest);
    await Promise.all(interestPodcasts.map(interestPodcast => {
        return followPodcast(userId, interestPodcast._id);
    }));
}

exports.signup = async (req, res, _) => {
    const data = Object.assign({}, { interests: [] }, req.body);

    if (!data.email || !data.username || !data.name || !data.password) {
        return res.sendStatus(422);
    }

    if (data.email && !validator.isEmail(data.email)) {
        return res.status(422).send('Invalid email address.');
    }

    if (data.username && !validator.isAlphanumeric(data.username)) {
        return res.status(422).send('Usernames must be alphanumeric.');
    }

    try {
        const exists = await User.findOne({
            $or: [{ email: data.email.toLowerCase() }, { username: data.username }],
        });

        if (exists) {
            res.status(409).send('A user already exists with that username or email.');
            return;
        }

        const user = await User.create(data);

        await client.feed('timeline', user._id).follow('user', user._id);
        if (process.env.NODE_ENV === 'production') {
            const obj = { meta: { data: {} } };

            obj.meta.data[`user:${user._id}`] = {
                email: user.email,
            };

            await events(obj);
        }
        await followInterest(user._id, { featured: true });
        // follow all podcasts and rss feeds specified in "interests" payload
        await Promise.all(data.interests.map(interest => {
            return followInterest(user._id, { interest });
        }));

        res.json({
            _id: user._id,
            email: user.email,
            interests: user.interests,
            jwt: jwt.sign({ email: user.email, sub: user._id }, config.jwt.secret),
            name: user.name,
            username: user.username,
        });
    } catch(err) {
        logger.error(err);
        res.status(500).send(err);
    };
};

exports.login = async (req, res, _) => {
    const data = req.body || {};

    if (!data.email || !data.password) {
        return res.sendStatus(401);
    }

    const email = data.email.toLowerCase();

    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.sendStatus(404);
        }
        try {
            if (!await user.verifyPassword(data.password)) {
                return res.sendStatus(403);
            }

            res.status(200).send({
                _id: user._id,
                email: user.email,
                interests: user.interests,
                jwt: jwt.sign({ email: user.email, sub: user._id }, config.jwt.secret),
                name: user.name,
                username: user.username,
            });
        } catch(err) {
            res.sendStatus(401);
        }
    } catch(err) {
        logger.error(err);
        res.status(422).send(err.errors);
    }
};

exports.forgotPassword = async (req, res, _) => {
    const data = req.body || {};
    const opts = { new: true, };
    const passcode = uuidv4();

    try {
        const user = await User.findOneAndUpdate(
            { email: data.email.toLowerCase() },
            { recoveryCode: passcode },
            opts,
        );
        if (!user) {
            return res.sendStatus(404);
        }

        res.sendStatus(200);
    } catch (err) {
        logger.error(err);
        res.sendStatus(500);
    }
};

exports.resetPassword = async (req, res, _) => {
    const data = req.body || {};
    const opts = { new: true, };

    try {
        const user = await User.findOneAndUpdate(
            { email: data.email.toLowerCase(), recoveryCode: data.passcode },
            { password: data.password },
            opts,
        );
        if (!user) {
            return res.sendStatus(404);
        }

        res.status(200).send({
            _id: user._id,
            email: user.email,
            interests: user.interests,
            jwt: jwt.sign( { email: user.email, sub: user._id }, config.jwt.secret),
            name: user.name,
            username: user.username,
        });
    } catch(err) {
        logger.error(err);
        res.sendStatus(422);
    }
};
