import logger from '../utils/logger';
import { ReadPageURL } from './feed.js';

const invalidExtensions = ['mp3', 'mp4', 'mov', 'm4a', 'mpeg'];

// determines if the given feedUrl is a podcast or not
export async function ParseOG(pageURL) {
	const pageStream = await ReadPageURL(pageURL);
	return ParseOGStream(pageStream, pageURL);
}

export function IsValidOGUrl(url) {
	if (!url) {
		return false;
	}
	const invalid = invalidExtensions.some(extension => {
		if (url.endsWith(`.${extension}`)) {
			return extension;
		}
	});
	if (invalid) {
		logger.warn(`Invalid file extension for url ${url}`);
		return false;
	}

	return true;
}

export function ParseOGStream(pageStream, pageURL) {
	const metaTagRe = /(<meta[^>]*?og:image[^>]*?>)/gm;
	const urlRe = /content="(.*?)"/gm;

	var end = new Promise((resolve, reject) => {
		pageStream
			.on('data', data => {
				const html = data.toString('utf8');
				if (!html.includes('og:image')) {
					return;
				}
				const matches = metaTagRe.exec(html);
				if (!matches) {
					return;
				}
				const meta = matches[1];
				const urlMatches = urlRe.exec(meta);
				if (urlMatches) {
					resolve(urlMatches[1]);
				}
			})
			.on('error', reject)
			.on('end', () => resolve(null));
	});
	return end;
}
