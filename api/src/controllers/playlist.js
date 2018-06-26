import async from 'async';

import Playlist from '../models/playlist';

import config from '../config';
import logger from '../utils/logger';
import search from '../utils/search';

async function listFilter(req, res) {
	const playlists = await Playlist.apiQuery(req.query);
	res.json(playlists);
}

exports.list = async (req, res, _) => {
	const query = req.query || {};
	if (query.user && query.user != req.User.id) {
		return res.sendStatus(403);
	}

	await listFilter(req, res);
};

exports.get = async (req, res, _) => {
	if (req.params.playlistId == 'undefined') {
		return res.sendStatus(404);
	}

	const playlist = await Playlist.findById(req.params.playlistId);
	if (!playlist) {
		return res.sendStatus(404);
	}

	if (playlist.user._id != req.User.id) {
		return res.sendStatus(403);
	}

	res.json(playlist);
};

exports.post = async (req, res, _) => {
	const data = Object.assign({}, req.body, { user: req.user.sub });

	let playlist;
	playlist = await Playlist.create(data);
	playlist = await Playlist.findById(playlist._id);

	await search({
		_id: playlist._id,
		episodes: playlist.episodes,
		name: playlist.name,
		type: 'playlist',
		user: playlist.user,
	});

	res.json(playlist);
};

exports.put = async (req, res, _) => {
	const playlist = await Playlist.findById(req.params.playlistId);

	if (!playlist) {
		return res.sendStatus(404);
	}

	if (playlist.user._id != req.User.id) {
		return res.sendStatus(403);
	}

	await Playlist.update({ _id: req.params.playlistId }, req.body, { new: true });

	res.json(await Playlist.findOne({ _id: req.params.playlistId }));
};

exports.delete = async (req, res, _) => {
	const playlist = await Playlist.findById(req.params.playlistId);

	if (!playlist) {
		return res.sendStatus(404);
	}

	if (playlist.user._id != req.User.id) {
		return res.sendStatus(403);
	}

	await Playlist.remove({ _id: req.params.playlistId });

	res.sendStatus(204);
};
