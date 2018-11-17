import request from 'request-promise-native';
import config from '../config';

export async function ParseContent(url) {
	return await request({
		json: true,
		uri: 'https://mercury.postlight.com/parser',
		headers: {
			'Content-Type': 'application/json',
			'x-api-key': config.mercury.key,
		},
		qs: { url },
	});
}
