import mongoose from 'mongoose';

import Alias from '../models/alias';
import Rss from '../models/rss';
import Podcast from '../models/podcast';
import { trackEngagement } from '../utils/analytics';
import { getStreamClient } from '../utils/stream';

exports.list = async (req, res) => {
	const query = req.query || {};

	if (query.type === 'rss' || query.type === 'podcast') {
		let obj = {};
		obj[query.type] = { $exists: true };
		obj['user'] = req.user.sub;
		return res.json(await Alias.find(obj).sort({ _id: -1 }));
	}

	res.json(await Alias.apiQuery(req.query));
};

exports.get = async (req, res) => {
	const aliasId = req.params.aliasId;
	if (!mongoose.Types.ObjectId.isValid(aliasId))
		return res.status(400).json({
			error: `Resource aliasId (${aliasId}) is an invalid ObjectId.`,
		});

	const alias = await Alias.findOne({ _id: aliasId, user: req.user.sub });
	if (!alias) return res.status(404).json({ error: 'Resource does not exist.' });
	res.json(alias);
};

exports.post = async (req, res) => {
	const data = Object.assign({}, req.body, { user: req.user.sub });
	const isRss = data.hasOwnProperty('rss');
	const isPodcast = data.hasOwnProperty('podcast');

	if (!(isRss || isPodcast)) return res.status(422).json({ error: 'Invalid request.' });
	if (isRss && isPodcast) return res.status(422).json({ error: 'Invalid request.' });
	if (!data.hasOwnProperty('alias'))
		return res.status(422).json({ error: 'Missing required fields.' });

	const exists = isRss
		? await Rss.findOne({ _id: data.rss })
		: await Podcast.findOne({ _id: data.podcast });
	if (!exists) return res.status(422).json({ error: "Resource doesn't exists." });

	if (!!(await Alias.findOne(data)))
		return res.status(409).json({ error: 'Resource already exists.' });

	const alias = await Alias.create(data);

	// await getStreamClient()
	// 	.feed('user', alias.user)
	// 	.addActivity({
	// 		actor: alias.user,
	// 		verb: 'alias',
	// 		object: alias._id,
	// 		foreign_id: `aliass:${alias._id}`,
	// 		time: alias.createdAt,
	// 	});

	// await trackEngagement(req.User, {
	// 	label: alias.rss ? 'alias_rss' : 'alias_podcast',
	// 	content: {
	// 		foreign_id: alias.rss ? `rss:${alias.rss}` : `podcast:${alias.podcast}`,
	// 	},
	// });
	res.json(await Alias.findOne({ _id: alias._id }));
};

exports.put = async (req, res) => {
	const aliasId = req.params.aliasId;
	const newAlias = req.body.alias;

	if (!newAlias) return res.status(422).json({ error: 'Missing required fields.' });
	if (!mongoose.Types.ObjectId.isValid(aliasId))
		return res.status(400).json({
			error: `Resource aliasId (${aliasId}) is an invalid ObjectId.`,
		});

	const alias = await Alias.findById(aliasId);

	if (!alias) return res.status(404).json({ error: 'Resource does not exist.' });
	if (alias.user._id != req.User.id) return res.sendStatus(403);

	res.json(await Alias.findByIdAndUpdate(aliasId, { alias: newAlias }, { new: true }));
};

exports.delete = async (req, res) => {
	const alias = await Alias.findOne({ _id: req.params.aliasId, user: req.user.sub });
	if (!alias) return res.status(404).json({ error: 'Resource does not exist.' });
	await alias.remove();
	res.sendStatus(204);
};
