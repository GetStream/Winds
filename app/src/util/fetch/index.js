import axios from 'axios';
import config from '../../config';

const fetch = (method, path, data, params) => {
	if (!method) {
		throw new Error('Method is a required field.');
	}

	if (!path) {
		throw new Error('Path is a required field.');
	}

	let options = {
		baseURL: config.api.url,
		data: data || {},
		headers: {
			'Authorization': `Bearer ${localStorage['jwt']}`,
			'Content-Type': 'application/json',
		},
		method: method.toUpperCase(),
		params: params || {},
		url: path,
	};

	return axios(options);
};

export default fetch;
