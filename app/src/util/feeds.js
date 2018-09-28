import fetch from './fetch';

const getFeed = (dispatch, type, page = 0, per_page = 10) => {
	if (!type) throw new Error('"type" not provided when fetching feed');

	fetch('GET', `/users/${localStorage['authedUser']}/feeds`, null, {
		page,
		per_page,
		type,
	}).then((res) => {
		const items = res.data.map((item) => {
			return { ...item, type };
		});

		if (type === 'episode') {
			dispatch({
				episodes: items,
				type: 'BATCH_UPDATE_EPISODES',
			});
		} else if (type === 'article') {
			dispatch({
				articles: items,
				type: 'BATCH_UPDATE_ARTICLES',
			});
		}
		dispatch({
			activities: items,
			feedID: `user_${type}:${localStorage['authedUser']}`,
			type: 'UPDATE_FEED',
		});
	});
};

export { getFeed };
