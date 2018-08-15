import request from 'request-promise-native';
import logger from '../utils/logger';
import config from '../config';

export async function ParseArticle(url) {
	let result = await request({
		json: true,
		uri: 'https://mercury.postlight.com/parser',
		headers: {
			'Content-Type': 'application/json',
			'x-api-key': config.mercury.key,
		},
		qs: {
			url: url,
		},
	});
	return result;
}
