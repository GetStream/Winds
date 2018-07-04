import mongoose from 'mongoose';

import Article from '../models/article';
import Follow from '../models/follow';
import Pin from '../models/pin';
import Podcast from '../models/podcast';
import RSS from '../models/rss';
import logger from '../utils/logger';

async function mergeFollows(lhsID, rhsID) {
	const [lhsFollows, rhsFollows] = await Promise.all([
		Follow.find({ rss: lhsID }).lean(),
		Follow.find({ rss: rhsID })
	]);
	//XXX: converting IDs to string to allow equality checks in set
	const lhsUsers = new Set(lhsFollows.map(f => String(f.user._id)));

	const update = rhsFollows.filter(f => !lhsUsers.has(String(f.user._id)));
	const remove = rhsFollows.filter(f => lhsUsers.has(String(f.user._id)));

	await Promise.all([
		...rhsFollows.map(f => f.removeFromStream()),
		Follow.updateMany({ _id: { $in: update.map(f => f._id) } }, { rss: lhsID }),
		Follow.remove({ _id: { $in: remove.map(f => f._id) } }),
	]);
	await Follow.getOrCreateMany(update.map(f => {
		return { type: 'rss', userID: f.user._id, publicationID: lhsID };
	}));
}

async function mergeArticlesAndPins(lhsID, rhsID) {
	const rhsArticles = await Article.find({ rss: rhsID }).lean();
	const rhsFingerprints = rhsArticles.map(a => a.fingerprint);
	const lhsArticlesWithMatchingFingerprints = await Article.find({
		rss: lhsID,
		fingerprint: { $in: rhsFingerprints }
	}).lean();
	const lhsIDs = lhsArticlesWithMatchingFingerprints.map(a => a._id);
	const lhsFingerprints = new Set(lhsArticlesWithMatchingFingerprints.map(a => a.fingerprint));

	const update = rhsArticles.filter(a => !lhsFingerprints.has(a.fingerprint));
	const remove = rhsArticles.filter(a => lhsFingerprints.has(a.fingerprint));

	const [removePins, lhsPins] = await Promise.all([
		Pin.find({ article: { $in: remove.map(a => a._id) } }),
		Pin.find({ article: { $in: lhsIDs } })
	]);

	const lhsPinFingerprints = new Set(lhsPins.map(p => p.article.fingerprint));
	const duplicatePins = removePins.filter(p => lhsPinFingerprints.has(p.article.fingerprint));
	const newPins = removePins.filter(p => !lhsPinFingerprints.has(p.article.fingerprint));

	const pinUpdates = newPins.map(p => {
		const article = lhsArticlesWithMatchingFingerprints.filter(a => a.fingerprint == p.article.fingerprint)[0];
		return Pin.updateOne({ _id: p._id }, { article });
	});
	await Promise.all([
		Article.updateMany({ _id: { $in: update.map(f => f._id) } }, { rss: lhsID }),
		...pinUpdates,
		Article.remove({ _id: { $in: remove.map(f => f._id) } }),
		Pin.remove({ _id: { $in: duplicatePins.map(f => f._id) } })
	]);
}

async function mergeFeedUrls(lhsID, rhsID) {
	const [lhs, rhs] = await Promise.all([
		RSS.findById(lhsID).lean(),
		RSS.findById(rhsID).lean()
	]);
	const feedUrls = new Set([lhs.feedUrl, rhs.feedUrl, ...lhs.feedUrls, ...rhs.feedUrls]);
	await RSS.updateOne({ _id: lhsID }, { feedUrls: [...feedUrls] });
}

export async function mergeFeeds(lhsID, rhsID) {
	lhsID = mongoose.Types.ObjectId(lhsID);
	rhsID = mongoose.Types.ObjectId(rhsID);

	await Promise.all([
		mergeFollows(lhsID, rhsID),
		mergeArticlesAndPins(lhsID, rhsID),
		mergeFeedUrls(lhsID, rhsID)
	]);
    await RSS.remove({ _id: rhsID });
}
