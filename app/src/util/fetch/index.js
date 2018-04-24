import axios from 'axios';
import config from '../../config';

const fetch = (method, path, data, params) => {
	return new Promise((resolve, reject) => {
		if (!method) {
			reject(new Error('Method is a required field.'));
		}

		if (!path) {
			reject(new Error('Path is a required field.'));
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

		axios(options)
			.then(res => {
				resolve(res);
			})
			.catch(err => {
				reject(err);
			});
	});
};

export default fetch;
