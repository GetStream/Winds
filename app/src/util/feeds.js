import fetch from './fetch';

const getFeed = (dispatch, type, page = 0, per_page = 10) => {
	if (!type) {
		throw new Error('"type" not provided when fetching feed');
	}
	fetch('GET', `/users/${localStorage['authedUser']}/feeds`, null, {
		page,
		per_page,
		type,
	}).then(response => {
		let items = response.data.map(item => {
			return { ...item, type };
		});

		if (type === 'episode') {
			let podcasts = [];
			for (let episode of items) {
				podcasts.push(episode.podcast);
			}
			dispatch({
				podcasts,
				type: 'BATCH_UPDATE_PODCASTS',
			});
			dispatch({
				episodes: items,
				type: 'BATCH_UPDATE_EPISODES',
			});
		} else if (type === 'article') {
			for (let article of items) {
				// update rss feed
				dispatch({
					rssFeed: article.rss,
					type: 'UPDATE_RSS_FEED',
				});
				// update article
				dispatch({
					rssArticle: article,
					type: 'UPDATE_ARTICLE',
				});
			}
		}
		dispatch({
			activities: items,
			feedID: `user_${type}:${localStorage['authedUser']}`,
			type: 'UPDATE_FEED',
		});
	});
};

export { getFeed };
