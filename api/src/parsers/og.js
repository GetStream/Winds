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

function parseImage(html) {
	const metaTagRe = /(<meta[^>]*?og:image[^>]*?>)/gm;
	const urlRe = /content="(.*?)"/gm;

	if (!html.includes('og:image')) {
		return {};
	}
	const matches = metaTagRe.exec(html);
	if (!matches) {
		return {};
	}
	const meta = matches[1];
	const urlMatches = urlRe.exec(meta);
	if (urlMatches) {
		return { image: urlMatches[1] };
	}
}

function parseCanonicalUrl(html) {
	if (html.includes('og:image')) {
		const metaTagRe = /(<meta[^>]*?og:url[^>]*?>)/gm;
		const matches = metaTagRe.exec(html);
		if (matches) {
			const meta = matches[1];
			const urlRe = /content="(.*?)"/gm;
			const urlMatches = urlRe.exec(meta);
			if (urlMatches) {
				return { canonicalUrl: urlMatches[1] };
			}
		}
	} else if (html.includes('"canonical"')) {
		const linkTagRe = /(<link[^>]*?rel\s*=\s*"canonical"[^>]*?>)/gm;
		const matches = linkTagRe.exec(html);
		if (matches) {
			const meta = matches[1];
			const urlRe = /href="(.*?)"/gm;
			const urlMatches = urlRe.exec(meta);
			if (urlMatches) {
				return { canonicalUrl: urlMatches[1] };
			}
		}
	}
	return {};
}

export function ParseOGStream(pageStream, pageURL) {
	let result = {};

	return new Promise((resolve, reject) => {
		pageStream
			.on('data', data => {
				const html = data.toString('utf8');
				for (const extractor of [parseImage, parseCanonicalUrl]) {
					result = Object.assign(result, extractor(html));
				}
				if (result.image && result.canonicalUrl) {
					pageStream.destroy();
					resolve(result);
				}
			})
			.on('error', reject)
			.on('end', () => resolve(result));
	});
}
