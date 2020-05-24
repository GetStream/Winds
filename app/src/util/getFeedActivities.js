import axios from 'axios';
import config from '../config';

const getFeedActivities = (feedID, jwt) => {
	return new Promise((resolve, reject) => {
		// determine type of feed and userID
		let feedParams = feedID.split(':');
		let feedType = feedParams[0];
		let userID = feedParams[1];
		axios({
			baseURL: config.api.url,
			headers: {
				Authorization: `Bearer ${jwt}`,
				'Content-Type': 'application/json',
			},
			method: 'GET',
			params: { type: feedType },
			url: `/users/${userID}/feeds`,
		})
			.then((res) => resolve(res))
			.catch((err) => reject(err));
	});
};

export default getFeedActivities;
