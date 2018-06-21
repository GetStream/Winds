import jwt from 'jsonwebtoken';
import streamAnalytics from 'stream-analytics';

import logger from './logger';
import config from '../config';

var streamAnalyticsClient = null;

export function getAnalyticsClient() {
	if (streamAnalyticsClient == null) {
		const token = jwt.sign(
			{
				action: '*',
				resource: '*',
				user_id: '*',
			},
			config.stream.apiSecret,
			{ algorithm: 'HS256', noTimestamp: true },
		);
		streamAnalyticsClient = new streamAnalytics({
			apiKey: config.stream.apiKey,
			token: token,
		});
	}
	return streamAnalyticsClient;
}

// tracks engagement for the given user
export async function trackEngagement(user, engagement) {
	let analyticsClient = getAnalyticsClient();
	analyticsClient.setUser({
		alias: user.email,
		id: user._id.toString(),
	});
	if (Object.keys(engagement).length && !config.analyticsDisabled) {
		const res = await analyticsClient.trackEngagement(engagement);
		return res;
	}
}
