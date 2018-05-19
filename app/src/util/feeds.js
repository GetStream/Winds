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
			for (let episode of items) {
				// update podcast
				dispatch({
					podcast: episode.podcast,
					type: 'UPDATE_PODCAST_SHOW',
				});
				// update episode
				dispatch({
					episode,
					type: 'UPDATE_EPISODE',
				});
			}

			dispatch({
				activities: items,
				feedID: `user_episode:${localStorage['authedUser']}`,
				type: 'UPDATE_FEED',
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
			dispatch({
				activities: items,
				feedID: `user_article:${localStorage['authedUser']}`,
				type: 'UPDATE_FEED',
			});
		}
	});
};

export { getFeed };
