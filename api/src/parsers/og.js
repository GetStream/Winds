import { ReadFeedURL } from './feed.js';
const metaTagRe = /(<meta.*og:image".*>)/gm;
const urlRe = /content="(.*?)"/gm;
import zlib from 'zlib';

// determines if the given feedUrl is a podcast or not
export async function ParseOG(pageURL) {
	let pageStream = await ReadFeedURL(pageURL);
	pageStream.pipe(zlib.createGunzip());
	let ogImage = await ParseOGStream(pageStream, pageURL);
	return ogImage;
}

export async function ParseOGStream(pageStream, pageURL) {
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
