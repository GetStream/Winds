import axios from 'axios';
import querystring from 'querystring';

import config from '../config';

export function extractRedditPostID(article) {
	const parts = article.link.split('/');
	if (parts.includes('comments')) {
		return 't3_' + parts[parts.indexOf('comments') + 1]
	}

	if (parts.includes('r')) {
		throw new Error(`Invalid URL (subreddit, not submission): ${article.link}`)
	}

	const id = parts[parts.length - 1];
	if (!/^[a-z0-9]+$/i.test(id)) {
		throw new Error(`Invalid URL: ${article.link}`)
	}
	return 't3_' + id;
}

export function extractHackernewsPostID(article) {
	const url = new URL(article.commentUrl);
	return url.searchParams.get('id');
}

const userAgent = 'web:winds:v2.2';
let accessToken;

async function refreshAccessToken() {
	const url = 'https://www.reddit.com/api/v1/access_token';
	const data = querystring.stringify({
		grant_type: 'password',
		username: config.social.reddit.username,
		password: config.social.reddit.password
	});
	const options = {
		headers: {
			'User-Agent': userAgent,
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		auth: {
			username: config.social.reddit.key,
			password: config.social.reddit.secret
		}
	};
	const response = await axios.post(url, data, options);

	accessToken = response.data.access_token;
}

async function tryRedditAPI(path, retries=3) {
	if (!accessToken) {
		await refreshAccessToken();
	}

	const url = 'https://oauth.reddit.com/api' + path;
	const options = {
		headers: {
			'User-Agent': userAgent,
			Authorization: `bearer ${accessToken}`
		}
	};
	while (retries) {
		try {
			return await axios.get(url, options);
		} catch (err) {
			if ([403, 401].includes(err.response.status)) {
				await refreshAccessToken();
				optins.headers.Authorization = `bearer ${accessToken}`;
				continue;
			}
			--retries;
		}
	}
	throw new Error(`Failed to perform call to '${path}'`);
}

async function tryHackernewsAPI(path, retries=3) {
	const url = 'https://hacker-news.firebaseio.com/v0' + path;
	while (retries) {
		try {
			return await axios.get(url);
		} catch (_) {
			--retries;
		}
	}
	throw new Error(`Failed to perform call to '${path}'`);
}

export async function redditScore(postID) {
	const response = await tryRedditAPI(`/info?id=${postID}`);
	return response.data.data.children[0].data.score;
}

export async function hackernewsScore(postID) {
    const response = await tryHackernewsAPI(`/item/${postID}.json`);
    return response.data.score;
}
