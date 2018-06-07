import axios from 'axios';
import logger from '../utils/logger';
import config from '../config';

export async function ParseArticle(url) {
	let result = await axios.get('https://mercury.postlight.com/parser', {
		headers: {
			'Content-Type': 'application/json',
			'x-api-key': config.mercury.key,
		},
		params: {
			url: url,
		},
	});
	return result;
}
