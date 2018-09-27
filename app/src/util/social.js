import axios from 'axios';
import * as urlParser from 'url';
import querystring from 'querystring';

import config from '../config';

export function extractRedditPostID(article) {
	if (!article.link.includes('reddit')) {
		return;
	}
	const parts = article.link.split('/');
	if (parts.includes('comments')) {
		return parts[parts.indexOf('comments') + 1];
	}

	if (parts.includes('r')) {
		throw new Error(`Invalid URL (subreddit, not submission): ${article.link}`);
	}

	const id = parts[parts.length - 1];
	if (!/^[a-z0-9]+$/i.test(id)) {
		throw new Error(`Invalid URL: ${article.link}`);
	}
	return id;
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
		headers: {
			'User-Agent': userAgent,
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		auth: {
			username: config.social.reddit.key,
			password: config.social.reddit.secret,
		},
	};
	const response = await axios.post(url, data, options);

	accessToken = response.data.access_token;
}

function sleep(time) {
	return new Promise((resolve) => (time ? setTimeout(resolve, time) : resolve()));
}

async function tryRedditAPI(path, retries = 3, backoffDelay = 20) {
	if (!accessToken) {
		await refreshAccessToken();
	}

	const url = 'https://oauth.reddit.com/api' + path;
	const options = {
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
			return await axios.get(url, options);
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

async function tryHackernewsAPI(path, retries = 3, backoffDelay = 20) {
	const url = 'https://hacker-news.firebaseio.com/v0' + path;
	let currentDelay = 0,
		nextDelay = backoffDelay;
	while (retries) {
		try {
			await sleep(currentDelay);
			return await axios.get(url);
		} catch (_) {
			--retries;
			[currentDelay, nextDelay] = [nextDelay, currentDelay + nextDelay];
		}
	}
	throw new Error(`Failed to perform call to '${path}'`);
}

async function tryHackernewsSearch(query, retries = 3, backoffDelay = 20) {
	const url = 'https://hn.algolia.com/api/v1/search';
	let currentDelay = 0,
		nextDelay = backoffDelay;
	while (retries) {
		try {
			await sleep(currentDelay);
			return await axios.get(url, {
				params: {
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
	const response = await tryRedditAPI(
		`/info?url=${article.canonicalUrl || article.url || article.link}`,
	);
	const postScores = response.data.data.children.map((c) => [c.data.id, c.data.score]);
	const [postID, score] = postScores.reduce((max, n) => (max[1] > n[1] ? max : n), [
		undefined,
		0,
	]);
	return postID && { url: `https://reddit.com/comments/${postID}`, score };
}

export async function hackernewsPost(article) {
	const response = await tryHackernewsSearch(
		article.canonicalUrl || article.url || article.link,
	);
	const postScores = response.data.hits.map((c) => [c.objectID, c.points]);
	const [postID, score] = postScores.reduce((max, n) => (max[1] > n[1] ? max : n), [
		undefined,
		0,
	]);
	return postID && { url: `https://news.ycombinator.com/item?id=${postID}`, score };
}

export async function redditScore(postID) {
	const response = await tryRedditAPI(`/info?id=t3_${postID}`);
	return {
		url: `https://reddit.com/comments/${postID}`,
		score: response.data.data.children[0].data.score,
	};
}

export async function hackernewsScore(postID) {
	const response = await tryHackernewsAPI(`/item/${postID}.json`);
	return {
		url: `https://news.ycombinator.com/item?id=${postID}`,
		score: response.data.score,
	};
}

const socialSources = {
	reddit: { extractID: extractRedditPostID, search: redditPost, score: redditScore },
	hackernews: {
		extractID: extractHackernewsPostID,
		search: hackernewsPost,
		score: hackernewsScore,
	},
};

export async function fetchSocialScore(source, article) {
	const { extractID, search, score } = socialSources[source];
	let id;
	try {
		id = extractID(article);
	} catch (_) {
		console.log(_);
		//XXX: ignore error
	}

	let result;
	if (id) {
		try {
			result = await score(id);
		} catch (_) {
			console.log(_);
			//XXX: ignore error
		}
	}
	if (!result) {
		try {
			result = await search(article);
		} catch (_) {
			console.log(_);
			//XXX: ignore error
		}
	}
	return result;
}
