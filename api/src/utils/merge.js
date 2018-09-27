import mongoose from 'mongoose';

import Article from '../models/article';
import Episode from '../models/episode';
import Follow from '../models/follow';
import Pin from '../models/pin';
import Podcast from '../models/podcast';
import RSS from '../models/rss';
import logger from '../utils/logger';

async function mergeFollows(lhsID, rhsID, type) {
	const [lhsFollows, rhsFollows] = await Promise.all([
		Follow.find({ [type]: lhsID }).lean(),
		Follow.find({ [type]: rhsID }),
	]);
	//XXX: converting IDs to string to allow equality checks in set
	const lhsUsers = new Set((lhsFollows || []).map(f => String(f.user._id)));

	const update = (rhsFollows || []).filter(
		f => f.user && !lhsUsers.has(String(f.user._id)),
	);
	const remove = (rhsFollows || []).filter(
		f => f.user && lhsUsers.has(String(f.user._id)),
	);

	await Promise.all([
		...(rhsFollows || []).map(f => f.removeFromStream()),
		Follow.updateMany({ _id: { $in: update.map(f => f._id) } }, { [type]: lhsID }),
		Follow.remove({ _id: { $in: remove.map(f => f._id) } }),
	]);
	await Follow.getOrCreateMany(
		update.map(f => {
			return { type, userID: f.user._id, publicationID: lhsID };
		}),
	);
}

async function mergeArticlesAndPins(lhsID, rhsID, type) {
	const model = type === 'rss' ? Article : Episode;
	const field = type === 'rss' ? 'article' : 'episode';
	const rhsArticles = await model.find({ rss: rhsID }).lean();
	const rhsFingerprints = rhsArticles.map(a => a.fingerprint);
	const lhsArticlesWithMatchingFingerprints = await model
		.find({
			rss: lhsID,
			fingerprint: { $in: rhsFingerprints },
		})
		.lean();
	const lhsIDs = lhsArticlesWithMatchingFingerprints.map(a => a._id);
	const lhsFingerprints = new Set(
		lhsArticlesWithMatchingFingerprints.map(a => a.fingerprint),
	);

	const update = rhsArticles.filter(a => !lhsFingerprints.has(a.fingerprint));
	const remove = rhsArticles.filter(a => lhsFingerprints.has(a.fingerprint));

	const [removePins, lhsPins] = await Promise.all([
		Pin.find({ [field]: { $in: remove.map(a => a._id) } }),
		Pin.find({ [field]: { $in: lhsIDs } }),
	]);

	const lhsPinFingerprints = new Set(lhsPins.map(p => p[field].fingerprint));
	const duplicatePins = removePins.filter(p =>
		lhsPinFingerprints.has(p[field].fingerprint),
	);
	const newPins = removePins.filter(p => !lhsPinFingerprints.has(p[field].fingerprint));

	const pinUpdates = newPins.map(p => {
		const article = lhsArticlesWithMatchingFingerprints.filter(
			a => a.fingerprint == p[field].fingerprint,
		)[0];
		return Pin.updateOne({ _id: p._id }, { [field]: article });
	});
	const articleUpdates = remove.map(r => {
		const article = lhsArticlesWithMatchingFingerprints.filter(
			a => a.fingerprint == r.fingerprint,
		)[0];
		return model.updateOne({ _id: r._id }, { duplicateOf: article._id });
	});
	await Promise.all([
		model.updateMany({ _id: { $in: update.map(f => f._id) } }, { rss: lhsID }),
		...pinUpdates,
		...articleUpdates,
		Pin.remove({ _id: { $in: duplicatePins.map(f => f._id) } }),
	]);
}

async function mergeFeedUrls(lhsID, rhsID, type) {
	const model = type === 'rss' ? RSS : Podcast;
	const [lhs, rhs] = await Promise.all([
		model.findById(lhsID).lean(),
		model.findById(rhsID).lean(),
	]);
	const feedUrls = new Set(
		[
			lhs.feedUrl,
			rhs.feedUrl,
			...(lhs.feedUrls || []),
			...(rhs.feedUrls || []),
		].filter(a => a),
	);
	await model.updateOne({ _id: lhsID }, { feedUrls: [...feedUrls] });
}

export async function mergeFeeds(lhsID, rhsID, type) {
	lhsID = mongoose.Types.ObjectId(lhsID);
	rhsID = mongoose.Types.ObjectId(rhsID);
	type = type.toLowerCase();
	const model = type === 'rss' ? RSS : Podcast;

	await Promise.all([
		mergeFollows(lhsID, rhsID, type),
		mergeArticlesAndPins(lhsID, rhsID, type),
		mergeFeedUrls(lhsID, rhsID, type),
	]);
	await model.updateOne({ _id: rhsID }, { duplicateOf: lhsID });
}
