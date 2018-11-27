import mongoose from 'mongoose';
import config from '../config';

import { getStreamClient } from '../utils/stream';
import Folder from '../models/folder';
import Rss from '../models/rss';
import Podcast from '../models/podcast';
import Article from '../models/article';
import Episode from '../models/episode';

exports.list = async (req, res) => {
	res.json(await Folder.find({ user: req.user.sub }));
};

exports.feed = async (req, res) => {
	const folderId = req.params.folderId;
	const limit = req.query.per_page || 10;
	const offset = req.query.page * limit || 0;
	/* Custom ranking in Stream Pro plan
	// Should be defined in Stream dashboard */
	const ranking = config.stream.pro
		? { ranking: req.query.sort_by === 'oldest' ? 'time_oldest' : '' }
		: {};

	const folder = await Folder.findById(req.params.folderId);
	if (!folder) return res.status(404).json({ error: 'Resource does not exist.' });
	if (folder.user._id != req.user.sub) return res.sendStatus(403);

	const response = await getStreamClient()
		.feed('folder', folderId)
		.get({ limit, offset, ...ranking });

	const streamFeeds = response.results.map((r) => {
		const split = r.foreign_id.split(':');
		return { type: split[0], id: split[1] };
	});

	const articleIds = streamFeeds.filter((f) => f.type === 'articles').map((f) => f.id);
	const espisodeIds = streamFeeds.filter((f) => f.type === 'episodes').map((f) => f.id);

	const articles = await Article.find({ _id: { $in: articleIds } });
	const episodes = await Episode.find({ _id: { $in: espisodeIds } });

	const feedLookup = [...articles, ...episodes].reduce((result, feed) => {
		result[feed._id] = feed;
		return result;
	}, {});

	let feeds = [];
	for (const f of streamFeeds) {
		let feed = feedLookup[f.id];
		if (!feed) {
			logger.error(`Failed to load ${f.type}:${f.id} in folder:${folderId}`);
			continue;
		}
		feeds.push(feed);
	}

	return res.json(feeds);
};

exports.get = async (req, res) => {
	const folder = await Folder.findById(req.params.folderId);
	if (!folder) return res.status(404).json({ error: 'Resource does not exist.' });
	if (folder.user._id != req.user.sub) return res.sendStatus(403);
	res.json(folder);
};

exports.post = async (req, res) => {
	const data = {
		user: req.user.sub,
		name: req.body.name || undefined,
		rss: req.body.rss || [],
		podcast: req.body.podcast || [],
	};

	if (!data.name) return res.status(422).json({ error: 'Missing required field' });

	if (!(await checkRssPodcast(data.rss, data.podcast)))
		return res.status(422).json({ error: 'Some wrong feed Id provided' });

	if (
		(data.rss.length &&
			(await Folder.find({ user: data.user, rss: { $in: data.rss } })).length) ||
		(data.podcast.length &&
			(await Folder.find({ user: data.user, podcast: { $in: data.podcast } }))
				.length)
	) {
		return res.status(422).json({ error: 'Feed already has a folder' });
	}

	const folder = await Folder.create(data);
	await streamFollowMany(folder);
	res.json(await Folder.findById(folder._id));
};

exports.put = async (req, res) => {
	const folderId = req.params.folderId;
	const removeFeed = req.body.action === 'remove';
	const name = req.body.name;
	const rss = req.body.rss;
	const podcast = req.body.podcast;
	const user = req.user.sub;

	const folder = await Folder.findById(folderId);
	if (!(name || rss || podcast))
		return res.status(422).json({ error: 'You have to put {name||rss||podcast}' });
	if (!folder) return res.status(404).json({ error: 'Resource does not exist.' });
	if (folder.user._id != user) return res.sendStatus(403);
	if ((rss || podcast) && !(await checkRssPodcast([rss], [podcast])))
		return res.status(404).json({ error: 'Wrong feed Id provided' });

	if (removeFeed) {
		await streamUnfollow(folderId, rss ? 'rss' : 'podcast', rss ? rss : podcast);
		const data = rss ? { $pull: { rss } } : { $pull: { podcast } };
		const removed = await Folder.findByIdAndUpdate(folderId, data, { new: true });
		return res.json(removed);
	}

	let data = {};
	if (rss) {
		const prevFolder = await Folder.findOne({ user, rss });
		if (prevFolder) {
			await Folder.findByIdAndUpdate(prevFolder._id, { $pull: { rss } });
			await streamUnfollow(prevFolder._id, 'rss', rss);
		}

		await streamFollow(folderId, 'rss', rss);
		data = { ...data, $push: { rss } };
	} else if (podcast) {
		const prevFolder = await Folder.findOne({ user, podcast });
		if (prevFolder) {
			await Folder.findByIdAndUpdate(prevFolder._id, { $pull: { podcast } });
			await streamUnfollow(prevFolder._id, 'podcast', podcast);
		}
		await streamFollow(folderId, 'podcast', podcast);
		data = { ...data, $push: { podcast } };
	}
	if (name) data = { name };

	const updatedFolder = await Folder.findByIdAndUpdate(folderId, data, { new: true });
	res.json(updatedFolder);
};

exports.delete = async (req, res) => {
	const folder = await Folder.findById(req.params.folderId);
	if (!folder) return res.status(404).json({ error: 'Resource does not exist.' });
	if (folder.user._id != req.user.sub) return res.sendStatus(403);
	await streamUnfollowMany(folder);
	await folder.remove();
	res.sendStatus(204);
};

async function checkRssPodcast(rssIDs, podcastIDs) {
	if (!rssIDs[0]) rssIDs = [];
	if (!podcastIDs[0]) podcastIDs = [];

	if (rssIDs.length) {
		const rss = await Rss.find({
			_id: { $in: rssIDs.map((_id) => mongoose.Types.ObjectId(_id)) },
		});
		if (rss.length != rssIDs.length) return false;
	}
	if (podcastIDs.length) {
		const podcast = await Podcast.find({
			_id: { $in: podcastIDs.map((_id) => mongoose.Types.ObjectId(_id)) },
		});
		if (podcast.length != podcastIDs.length) return false;
	}
	return true;
}

async function streamFollow(folderId, type, feedId) {
	const feed = getStreamClient().feed('folder', folderId);
	return await feed.follow(type, feedId);
}

async function streamUnfollow(folderId, type, feedId) {
	const feed = getStreamClient().feed('folder', folderId);
	return await feed.unfollow(type, feedId);
}

async function streamFollowMany(folder) {
	const feedRels = generateRels(folder);
	if (feedRels.length > 0) await getStreamClient().followMany(feedRels);
}

async function streamUnfollowMany(folder) {
	const feedRels = generateRels(folder);
	if (feedRels.length > 0) await getStreamClient().unfollowMany(feedRels);
}

function generateRels(folder) {
	const rssRel = folder.rss.map((r) => ({
		source: `folder:${folder._id}`,
		target: `rss:${r._id}`,
	}));
	const podcastRel = folder.podcast.map((p) => ({
		source: `folder:${folder._id}`,
		target: `podcast:${p._id}`,
	}));
	return [...rssRel, ...podcastRel];
}
