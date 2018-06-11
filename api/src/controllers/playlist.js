import async from 'async';

import Playlist from '../models/playlist';
import Like from '../models/like';

import config from '../config';
import logger from '../utils/logger';
import search from '../utils/search';

async function listRecommended(req, res) {
	const playlists = await Playlist.apiQuery(req.query);
	const likedPlaylists = playlists.map(async playlist => {
		const like = await Like.findOne({ playlist: playlist._id, user: req.user.sub });
		return Object.assign(playlist.toObject(), { liked: !!like });
	});
	res.json(await Promise.all(likedPlaylists));
}

async function listFeatured(req, res) {
	const playlists = await Playlist.apiQuery(req.query);
	if (playlists.length === 0) {
		return res.status(204).send('No featured playlist');
	}
	const random = playlists.sort(() => 0.5 - Math.random());
	res.json(random[0]);
}

async function listFilter(req, res) {
	const playlists = await Playlist.apiQuery(req.query);
	const likedPlaylists = playlists.map(async playlist => {
		const likes = await Like.count({ playlist: playlist });
		const like = await Like.findOne({ playlist: playlist._id, user: req.user.sub });
		return Object.assign(playlist.toObject(), { liked: !!like, likes });
	});
	res.json(await Promise.all(likedPlaylists));
}

exports.list = async (req, res, _) => {
	const query = req.query || {};
	if (query.user && query.user != req.User.id) {
		return res.sendStatus(403);
	}

	switch (query.type) {
	case 'recommended':
		return await listRecommended(req, res);
	case 'featured':
		return await listFeatured(req, res);
	}
	await listFilter(req, res);
};

exports.get = async (req, res, _) => {
	if (req.params.playlistId == 'undefined') {
		return res.sendStatus(404);
	}

	const playlist = await Playlist.findById(req.params.playlistId)
	if (!playlist) {
		return res.sendStatus(404);
	}
	if (playlist.user._id != req.User.id) {
		return res.sendStatus(403);
	}

	const like = await Like.findOne({ playlist: playlist._id, user: req.user.sub }).lean()
	res.json(Object.assign(playlist.toObject(), { liked: !!like }));
};

exports.post = async (req, res, _) => {
	const data = Object.assign({}, req.body, { user: req.user.sub });
	//XXX: create isn't autopopulating the `user` field
	//     so we have to retrieve the enriched object after creation
	let playlist = await Playlist.create(data);
	playlist = await Playlist.findById(playlist._id);
	// add to algolia
	await search({
		_id: playlist._id,
		episodes: playlist.episodes,
		name: playlist.name,
		type: 'playlist',
		user: playlist.user,
	})
	res.json(playlist);
};

exports.put = async (req, res, _) => {
	const data = req.body || {};
	const playlist = await Playlist.findById(req.params.playlistId);
	if (!playlist) {
		return res.sendStatus(404);
	}
	if (playlist.user._id != req.User.id) {
		return res.sendStatus(403);
	}
	//XXX: findByIdAndUpdate isn't autopopulating the `user` field
	//     so we have to retrieve the enriched object after update
	await Playlist.update({ _id: req.params.playlistId }, data, { new: true });
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
