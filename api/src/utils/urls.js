import config from '../config';
import util from 'util';

const urlMap = {
	article_detail: 'rss/%s/articles/%s',
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
	const protocol = (request.connection && request.connection.encrypted ? 'https' : 'http') + '://';
	let canonicalUrl;
	if (request.res) {
		canonicalUrl = request.res.responseUrl;
	}
	if (!canonicalUrl && request.domain) {
		canonicalUrl = protocol + request.domain;
	}
	if (!canonicalUrl) {
		const host = request.headers ? request.headers['host'] : request.getHeader('Host');
		canonicalUrl = protocol + host;
	} else {
		canonicalUrl = '';
	}
	return canonicalUrl;
}
