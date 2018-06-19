import normalizeUrl from 'normalize-url';
import validator from 'validator';
import logger from './logger';

export function isURL(url) {
	if (!url) {
		return false;
	}
	if (typeof url != 'string') {
		return false;
	}
	if (url.indexOf('newsletter:') == 0) {
		return false;
	}
	// make sure that mysubdomain-.google.com works and myurl.com/?q=hello world also works
	let variations = [url, url.replace(' ', '+'), url.replace('-.', '-a.')];
	try {
		variations.push(normalizeUrl(url));
	} catch (e) {
		logger.info(`normalization failed for url ${url}`);
	}
	let valid = variations.some(v => {
		let ok = validator.isURL(v, {
			allow_underscores: true,
			allow_trailing_dot: true,
		});
		return ok;
	});
	return valid;
}
