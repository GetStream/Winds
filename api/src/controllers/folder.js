import mongoose from 'mongoose';

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

	const response = await getStreamClient()
		.feed('folder', folderId)
		.get({ limit, offset });

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
		return res.status(404).json({ error: 'Some wrong feed Id provided' });

	const folder = await Folder.create(data);
	await streamFollowMany(folder);
	res.json(await Folder.findById(folder._id));
};

exports.put = async (req, res) => {
	const folderId = req.params.folderId;
	const name = req.body.name;
	const rss = req.body.rss;
	const podcast = req.body.podcast;

	const folder = await Folder.findById(folderId);
	if (!folder) return res.status(404).json({ error: 'Resource does not exist.' });
	if (folder.user._id != req.user.sub) return res.sendStatus(403);

	let data = {};
	if (name) {
		data = { name };
	} else if (rss) {
		if (!(await checkRssPodcast([rss], [])))
			return res.status(404).json({ error: 'Wrong feed Id provided' });
		const exist = folder.rss.find((r) => String(r._id) === rss);
		if (exist) {
			data = { $pull: { rss } };
			await streamUnfollow(folderId, 'rss', rss);
		} else {
			data = { $push: { rss } };
			await streamFollow(folderId, 'rss', rss);
		}
	} else if (podcast) {
		if (!(await checkRssPodcast([], [podcast])))
			return res.status(404).json({ error: 'Wrong feed Id provided' });

		const exist = folder.podcast.find((p) => String(p._id) === podcast);
		if (exist) {
			data = { $pull: { podcast } };
			await streamUnfollow(folderId, 'podcast', podcast);
		} else {
			data = { $push: { podcast } };
			await streamFollow(folderId, 'podcast', podcast);
		}
	} else
		return res.status(422).json({ error: 'You have to put a {name||rss||podcast}' });

	const updatedFolder = await Folder.findByIdAndUpdate(folderId, data, { new: true });
	res.json(updatedFolder);
};

//TODO Unfollow Feeds
exports.delete = async (req, res) => {
	const unfollow = req.body.unfollow;
	const folder = await Folder.findById(req.params.folderId);
	if (!folder) return res.status(404).json({ error: 'Resource does not exist.' });
	if (folder.user._id != req.user.sub) return res.sendStatus(403);
	await streamUnfollowMany(folder);
	await folder.remove();
	res.sendStatus(204);
};

async function checkRssPodcast(rssIDs, podcastIDs) {
	const rss = await Rss.find({
		_id: { $in: rssIDs.map((_id) => mongoose.Types.ObjectId(_id)) },
	});
	if (rss.length != rssIDs.length) return false;

	const podcast = await Podcast.find({
		_id: { $in: podcastIDs.map((_id) => mongoose.Types.ObjectId(_id)) },
	});
	if (podcast.length != podcastIDs.length) return false;

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
	const podcastRel = folder.rss.map((p) => ({
		source: `folder:${folder._id}`,
		target: `podcast:${p._id}`,
	}));
	return [...rssRel, ...podcastRel];
}
