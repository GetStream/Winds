import mongoose from 'mongoose';

import Tag from '../models/tag';

exports.list = async (req, res) => {
	res.json(await Tag.find({ user: req.user.sub }));
};

exports.get = async (req, res) => {
	const tag = await Tag.findById(req.params.tagId);
	if (!tag) return res.status(404).json({ error: 'Resource does not exist.' });
	if (tag.user._id != req.user.sub) return res.sendStatus(403);
	res.json(tag);
};

exports.post = async (req, res) => {
	const data = {
		user: req.user.sub,
		name: req.body.name,
		article: req.body.article || [],
		episode: req.body.episode || [],
	};

	if (!data.name) return res.status(422).json({ error: 'Missing required field' });

	const tag = await Tag.create(data);
	res.json(await Tag.findById(tag._id));
};

exports.put = async (req, res) => {
	const tagId = req.params.tagId;
	const name = req.body.name;
	const article = req.body.article;
	const episode = req.body.episode;
	const user = req.user.sub;
	const remove = req.body.action === 'remove';

	if (!(name || article || episode))
		return res.status(422).json({ error: 'You have to put data' });
	if (article && episode) return res.status(422).json({ error: 'On Feed at a time!' });

	const tag = await Tag.findById(tagId).lean();
	if (!tag) return res.status(404).json({ error: 'Resource does not exist.' });
	if (tag.user._id != user) return res.sendStatus(403);

	let data = {};
	if (remove) data = article ? { $pull: { article } } : { $pull: { episode } };
	else data = article ? { $addToSet: { article } } : { $addToSet: { episode } };

	if (name) data = { ...data, name };
	await Tag.findByIdAndUpdate(tagId, data);
	res.json(await Tag.findById(tagId));
};

exports.delete = async (req, res) => {
	const tag = await Tag.findById(req.params.tagId);
	if (!tag) return res.status(404).json({ error: 'Resource does not exist.' });
	if (tag.user._id != req.user.sub) return res.sendStatus(403);
	await tag.remove();
	res.sendStatus(204);
};
