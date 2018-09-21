import request from 'request-promise-native';

import '../config';
import db from '../utils/db';

import Rss from '../models/rss';
import Article from '../models/article';

async function tryHackernewsAPI(path, retries = 5) {
	const url = 'https://hacker-news.firebaseio.com/v0' + path;
	while (retries) {
		try {
			return await request(url, { json: true });
		} catch (_) {
			--retries;
		}
	}
	throw new Error(`Failed to perform call to '${path}'`);
}

async function hackernewsData(postID) {
	const response = await tryHackernewsAPI(`/item/${postID}.json`);
	return response.data;
}

async function hackernewsTop() {
	const response = await tryHackernewsAPI('/topstories.json');
	return response.data;
}

function commentUrl(postID) {
	return `https://news.ycombinator.com/item?id=${postID}`;
}

async function main() {
	await db;

	const ids = await hackernewsTop();
	const posts = await Promise.all(ids.map(hackernewsData));
	const urlToScore = posts.reduce(
		(map, post) => map.set(post.url, post.score),
		new Map(),
	);
	const commentUrlToScore = posts.reduce(
		(map, post) => map.set(commentUrl(post.id), post.score),
		new Map(),
	);
	const [urlMatch, commentUrlMatch] = await Promise.all([
		Article.find({ url: { $in: [...urlToScore.keys()] } }),
		Article.find({ commentUrl: { $in: [...commentUrlToScore.keys()] } }),
	]);
	const batch = Article.collection.initializeUnorderedBulkOp();
	for (const match of urlMatch) {
		batch
			.find({ _id: match._id })
			.updateOne({ $set: { 'socialScore.hackernews': urlToScore.get(match.url) } });
	}
	for (const match of commentUrlMatch) {
		batch.find({ _id: match._id }).updateOne({
			$set: {
				'socialScore.hackernews': commentUrlToScore.get(match.commentUrl),
			},
		});
	}
	await batch.execute();
}

main()
	.then(() => {
		console.info('done');
		process.exit(0);
	})
	.catch(err => {
		console.info(`failed with err ${err.stack}`);
		process.exit(1);
	});
