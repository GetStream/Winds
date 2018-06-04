import axios from 'axios';
import jwt from 'jsonwebtoken';

import config from '../../config';

const personalization = async data => {
	const token = jwt.sign(
		{
			action: '*',
			feed_id: '*',
			resource: '*',
			user_id: '*',
		},
		config.stream.apiSecret,
		{ algorithm: 'HS256', noTimestamp: true },
	);

	let response = await axios({
		baseURL: config.stream.baseUrl,
		headers: {
			'Authorization': token,
			'Content-Type': 'application/json',
			'Stream-Auth-Type': 'jwt',
		},
		method: 'GET',
		params: {
			api_key: config.stream.apiKey,
			user_id: data.userId,
		},
		url: data.endpoint,
	});
	return response.data.results.map(result => {
		return result.foreign_id.split(':')[1];
	});
};

export default personalization;
