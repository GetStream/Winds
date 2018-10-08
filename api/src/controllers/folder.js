import mongoose from 'mongoose';

import Folder from '../models/folder';
import Rss from '../models/rss';
import Podcast from '../models/podcast';

exports.list = async (req, res) => {
	res.json(await Folder.find({ user: req.user.sub }));
};

exports.feed = async (req, res) => {
	//TODO
	res.sendStatus(404);
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
	res.json(await Folder.findById(folder._id));
};

exports.put = async (req, res) => {
	const folderId = req.params.folderId;
	const name = req.body.name;
	const rss = req.body.rss || [];
	const podcast = req.body.podcast || [];

	const folder = await Folder.findById(folderId);
	if (!folder) return res.status(404).json({ error: 'Resource does not exist.' });
	if (folder.user._id != req.user.sub) return res.sendStatus(403);

	if (!(await checkRssPodcast(rss, podcast)))
		return res.status(404).json({ error: 'Some wrong feed Id provided' });

	let data = { podcast, rss };
	if (name) data = { ...data, name };

	res.json(await Folder.findByIdAndUpdate(folderId, data, { new: true }));
};

exports.delete = async (req, res) => {
	const folder = await Folder.findById(req.params.folderId);
	// return res.json({ folder: folder.user._id, user: req.user.sub });
	if (!folder) return res.status(404).json({ error: 'Resource does not exist.' });
	if (folder.user._id != req.user.sub) return res.sendStatus(403);

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
