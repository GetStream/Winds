import fetch from './fetch';

const getFeed = (dispatch, type, page = 0, per_page = 10) => {
	if (!type) {
		throw new Error('"type" not provided when fetching feed');
	}
	fetch('GET', `/users/${localStorage['authedUser']}/feeds`, null, {
		page,
		per_page,
		type,
	}).then((res) => {
		let items = res.data.map((item) => {
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
			// need to batch this up
			let rssFeeds = [];
			for (let article of items) {
				rssFeeds.push(article.rss);
			}
			dispatch({
				rssFeeds,
				type: 'BATCH_UPDATE_RSS_FEEDS',
			});
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
