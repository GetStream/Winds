import url from 'url';

import { extractHostname } from './urls';

export function setupAxiosRedirectInterceptor(axios) {
	// Disable built-in following of redirects and instead manually intercept and fix
	// possibly unescaped sequences in location header
	const request = axios.interceptors.request.use(config => {
		return Object.assign(config, {
			maxRedirects: 0,
			_maxRedirects: config._maxRedirects || config.maxRedirects,
		});
	}, Promise.reject);

	const response = axios.interceptors.response.use(
		res => res,
		err => {
			if (!err.response || err.response.status > 399) {
				return Promise.reject(err);
			}
			if (!err.config._maxRedirects) {
				return Promise.reject(new Error('Max redirects exceeded.'));
			}
			let location = err.response.headers['location'];
			try {
				if (!url.parse(location).hostname) {
					location = url.resolve(extractHostname(err.response.request), location);
				}
			} catch (_) {
				//XXX: ignore error
			}
			const config = Object.assign({}, err.config, {
				url: location,
				maxRedirects: 0,
				_maxRedirects: err.config._maxRedirects - 1,
			});
			return axios(config);
		},
	);
	return { request, response };
}

export function cleanupAxiosRedirectInterceptor(axios, { request, response }) {
	axios.interceptors.request.eject(request);
	axios.interceptors.response.eject(response);
}
