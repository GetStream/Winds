import logger from '../utils/logger';
import { ReadPageURL } from './feed.js';

const invalidExtensions = ['mp3', 'mp4', 'mov', 'm4a', 'mpeg'];

// determines if the given feedUrl is a podcast or not
export async function ParseOG(pageURL) {
	let pageStream = await ReadPageURL(pageURL);
	let ogImage = await ParseOGStream(pageStream, pageURL);
	return ogImage;
}

export async function IsValidOGUrl(url) {
	if (!url) {
		return false;
	}
	let invalid = invalidExtensions.some(extension => {
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

export async function ParseOGStream(pageStream, pageURL) {
	let metaTagRe = /(<meta[^>]*?og:image[^>]*?>)/gm;
	let urlRe = /content="(.*?)"/gm;

	var end = new Promise(function(resolve, reject) {
		pageStream
			.on('error', reject)
			.on('end', () => {
				resolve(null);
			})
			.on('readable', function() {
				var stream = this,
					item;
				while ((item = stream.read())) {
					let html = item.toString('utf8');
					if (html.indexOf('og:image') != -1) {
						let matches = metaTagRe.exec(html);

						if (matches) {
							let meta = matches[1];
							let urlMatches = urlRe.exec(meta);
							if (urlMatches) {
								return resolve(urlMatches[1]);
							}
						}
					}
				}
			});
	});
	return end;
}
