import fetch from './fetch';

export const getFeed = (dispatch, type, page = 0, per_page = 10) => {
	if (!type) throw new Error('"type" not provided when fetching feed');

	fetch('GET', `/users/${localStorage['authedUser']}/feeds`, null, {
		page,
		per_page,
		type,
	}).then((res) => {
		if (type === 'episode')
			dispatch({ episodes: res.data, type: 'BATCH_UPDATE_EPISODES' });
		else if (type === 'article')
			dispatch({ articles: res.data, type: 'BATCH_UPDATE_ARTICLES' });
	});
};
