import config from '../config';
import util from 'util';

const urlMap = {
	article_detail: 'rss/%s/articles/%s',
	episode_detail: 'podcast/%s/episodes/%s',
	rss_detail: 'rss/%s',
	podcast_detail: 'podcast/%s',
};

export function getUrl(urlName, ...args) {
	const format = urlMap[urlName];
	const path = util.format(format, ...args);
	const url = config.url + '/' + path;

	return url;
}

export function extractHostname(request) {
	const protocol =
		(request.connection && request.connection.encrypted ? 'https' : 'http') + '://';
	let canonicalUrl = '';
	if (request.uri) {
		canonicalUrl = `${request.uri.protocol}//${request.uri.host}`;
	}
	if (!canonicalUrl && request.href) {
		canonicalUrl = request.href;
	}
	if (!canonicalUrl && request.res) {
		canonicalUrl = request.res.responseUrl;
	}
	if (!canonicalUrl && request.domain) {
		canonicalUrl = protocol + request.domain;
	}
	if (!canonicalUrl) {
		const host =
			request.originalHost ||
			request.host ||
			(request.headers ? request.headers['host'] : request.getHeader('Host'));
		canonicalUrl = protocol + host;
	}
	return canonicalUrl;
}

export function ensureEncoded(url) {
	if (url == decodeURI(url)) {
		return encodeURI(url);
	}
	return url;
}
