import request from 'request-promise-native';
import * as urlParser from 'url';
import querystring from 'querystring';

import config from '../config';

export function extractRedditPostID(article) {
	if (!article.link.includes('reddit')) {
		return;
	}
	const parts = article.link.split('/');
	if (parts.includes('comments')) {
		return 't3_' + parts[parts.indexOf('comments') + 1];
	}

	if (parts.includes('r')) {
		throw new Error(`Invalid URL (subreddit, not submission): ${article.link}`);
	}

	const id = parts[parts.length - 1];
	if (!/^[a-z0-9]+$/i.test(id)) {
		throw new Error(`Invalid URL: ${article.link}`);
	}
	return 't3_' + id;
}

export function extractHackernewsPostID(article) {
	if (!article.commentUrl.includes('ycombinator')) {
		return;
	}
	const url = urlParser.parse(article.commentUrl, true);
	return url.query.id;
}

const userAgent = 'web:winds:v2.2';
let accessToken;

async function refreshAccessToken() {
	const url = 'https://www.reddit.com/api/v1/access_token';
	const data = querystring.stringify({
		grant_type: 'password',
		username: config.social.reddit.username,
		password: config.social.reddit.password,
	});
	const options = {
		uri: url,
		json: true,
		headers: {
			'User-Agent': userAgent,
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		auth: {
			user: config.social.reddit.key,
			pass: config.social.reddit.secret,
		},
		body: data,
	};
	const response = await request.post(options);

	accessToken = response.access_token;
}

function sleep(time) {
	return new Promise(resolve => (time ? setTimeout(resolve, time) : resolve()));
}

async function tryRedditAPI(path, retries = 2, backoffDelay = 30) {
	if (!accessToken) {
		await refreshAccessToken();
	}

	const url = 'https://oauth.reddit.com/api' + path;
	const options = {
		json: true,
		headers: {
			'User-Agent': userAgent,
			Authorization: `bearer ${accessToken}`,
		},
	};
	let currentDelay = 0,
		nextDelay = backoffDelay;
	while (retries) {
		try {
			await sleep(currentDelay);
			return await request(url, options);
		} catch (err) {
			if ([403, 401].includes(err.response.status)) {
				await refreshAccessToken();
				options.headers.Authorization = `bearer ${accessToken}`;
				continue;
			}
			--retries;
			[currentDelay, nextDelay] = [nextDelay, currentDelay + nextDelay];
		}
	}
	throw new Error(`Failed to perform call to '${path}'`);
}

async function tryHackernewsAPI(path, retries = 2, backoffDelay = 30) {
	const url = 'https://hacker-news.firebaseio.com/v0' + path;
	let currentDelay = 0,
		nextDelay = backoffDelay;
	while (retries) {
		try {
			await sleep(currentDelay);
			return await request(url, { json: true });
		} catch (_) {
			--retries;
			[currentDelay, nextDelay] = [nextDelay, currentDelay + nextDelay];
		}
	}
	throw new Error(`Failed to perform call to '${path}'`);
}

async function tryHackernewsSearch(query, retries = 2, backoffDelay = 30) {
	const url = 'https://hn.algolia.com/api/v1/search';
	let currentDelay = 0,
		nextDelay = backoffDelay;
	while (retries) {
		try {
			await sleep(currentDelay);
			return await request(url, {
				json: true,
				qs: {
					restrictSearchableAttributes: 'url',
					tags: 'story',
					query,
				},
			});
		} catch (_) {
			--retries;
			[currentDelay, nextDelay] = [nextDelay, currentDelay + nextDelay];
		}
	}
	throw new Error(`Failed to perform call to '${url}'`);
}

export async function redditPost(article) {
	const response = await tryRedditAPI(`/info?url=${article.url}`);
	const postScores = response.data.children.map(c => c.data.score);
	return postScores.reduce((max, n) => Math.max(max, n), 0);
}

export async function hackernewsPost(article) {
	const response = await tryHackernewsSearch(article.url);
	const postScores = response.hits.map(c => c.points);
	return postScores.reduce((max, n) => Math.max(max, n), 0);
}

export async function redditScore(postID) {
	const response = await tryRedditAPI(`/info?id=${postID}`);
	return response.data.children[0].data.score;
}

export async function hackernewsScore(postID) {
	const response = await tryHackernewsAPI(`/item/${postID}.json`);
	return response.score;
}

const socialSources = {
	reddit: { extractID: extractRedditPostID, search: redditPost, score: redditScore },
	hackernews: {
		extractID: extractHackernewsPostID,
		search: hackernewsPost,
		score: hackernewsScore,
	},
};

export async function fetchSocialScore(article) {
	const entries = await Promise.all(
		Object.entries(socialSources).map(
			async ([source, { extractID, search, score }]) => {
				let id;
				try {
					id = extractID(article);
				} catch (_) {
					//XXX: ignore error
				}

				let result;
				if (id) {
					try {
						result = [source, await score(id)];
					} catch (_) {
						//XXX: ignore error
					}
				}
				if (!result) {
					try {
						result = [source, await search(article)];
					} catch (_) {
						result = [source, 0];
					}
				}
				return result;
			},
		),
	);

	// assemble entries w/ positive score into an object
	return entries
		.filter(([_, score]) => !!score)
		.reduce((obj, [source, score]) => Object.assign(obj, { [source]: score }), {});
}
