import Analytics from 'stream-analytics';
import axios from 'axios';
import config from '../../config';
import jwt from 'jsonwebtoken';
import logger from '../logger';

const token = jwt.sign(
	{
		action: '*',
		resource: '*',
		user_id: '*',
	},
	config.stream.apiSecret,
	{ algorithm: 'HS256', noTimestamp: true },
);

const noop = async () => {};

const analytics = new Analytics({
	apiKey: config.stream.apiKey,
	token: token,
});

async function trackingWrapper(fn) {
	return async (args) => {
		try{
			return await fn(...args);
		} catch(err) {
			logger.warn({err});
		}
	};
}

async function TrackMetadata(key, data) {
	if(config.analyticsDisabled){
		return;
	}
	try {
		let payload = {data: {[key]: data}};
		await axios({
			data: payload,
			headers: {
				'Authorization': token,
				'stream-auth-type': 'jwt',
			},
			method: 'POST',
			params: {
				api_key: config.stream.apiKey,
			},
			url: `${config.stream.baseUrl}/winds_meta/`,
		});
	} catch (err) {
		logger.warn({err});
	}
}

async function AnalyticsMiddleware(req, res, next) {
	try {
		if (req.User) {
			analytics.setUser({
				alias: req.User.email,
				id: req.User._id,
			});
		}
		req.analytics = {
			trackImpression: config.analyticsDisabled ? noop : trackingWrapper(analytics.trackImpression.bind(analytics)),
			trackEngagement: config.analyticsDisabled ? noop : trackingWrapper(analytics.trackEngagement.bind(analytics)),
		};
		next();
	} catch (err) {
		next(err);
	}
}

export {AnalyticsMiddleware, TrackMetadata};
