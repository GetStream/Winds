import fetch from '../util/fetch';

const unpinArticle = (pinID, articleID, dispatch) => {
	fetch('DELETE', `/pins/${pinID}`)
		.then(() => {
			dispatch({
				articleID,
				type: 'UNPIN_ARTICLE',
			});
		})
		.catch(err => {
			if (window.console) {
				console.log(err); // eslint-disable-line no-console
			}
		});
};

const pinArticle = (articleID, dispatch) => {
	window.streamAnalyticsClient.trackEngagement({
		label: 'pinned_article',
		content: {
			foreign_id: `articles:${articleID}`,
		},
	});

	fetch('POST', '/pins', {
		article: articleID,
	})
		.then(res => {
			dispatch({
				pin: res.data,
				type: 'PIN_ARTICLE',
			});
		})
		.catch(err => {
			if (window.console) {
				console.log(err); // eslint-disable-line no-console
			}
		});
};

const pinEpisode = (episodeID, dispatch) => {
	window.streamAnalyticsClient.trackEngagement({
		label: 'pinned_episode',
		content: {
			foreign_id: `episodes:${episodeID}`,
		},
	});

	fetch('POST', '/pins', {
		episode: episodeID,
	})
		.then(res => {
			dispatch({
				pin: res.data,
				type: 'PIN_EPISODE',
			});
		})
		.catch(err => {
			if (window.console) {
				console.log(err); // eslint-disable-line no-console
			}
		});
};

const unpinEpisode = (pinID, episodeID, dispatch) => {
	fetch('DELETE', `/pins/${pinID}`)
		.then(() => {
			dispatch({
				episodeID,
				type: 'UNPIN_EPISODE',
			});
		})
		.catch(err => {
			if (window.console) {
				console.log(err); // eslint-disable-line no-console
			}
		});
};

const getPinnedArticles = dispatch => {
	fetch('GET', '/pins', null, {
		type: 'article',
		user: localStorage['authedUser'],
	}).then(res => {
		let rssFeeds = [];
		let articles = [];

		for (let pin of res.data) {
			rssFeeds.push(pin.article.rss);
			articles.push(pin.article);
		}

		dispatch({
			rssFeeds,
			type: 'BATCH_UPDATE_RSS_FEEDS',
		});

		dispatch({
			articles,
			type: 'BATCH_UPDATE_ARTICLES',
		});

		dispatch({
			pins: res.data,
			type: 'BATCH_PIN_ARTICLES',
		});
	});
};

const getPinnedEpisodes = dispatch => {
	fetch('GET', '/pins', null, { type: 'episode' }).then(res => {
		let podcasts = [];
		let episodes = [];
		for (let pin of res.data) {
			podcasts.push(pin.episode.podcast);
			episodes.push(pin.episode);
		}

		dispatch({
			podcasts,
			type: 'BATCH_UPDATE_PODCASTS',
		});

		dispatch({
			episodes,
			type: 'BATCH_UPDATE_EPISODES',
		});

		dispatch({
			pins: res.data,
			type: 'BATCH_PIN_EPISODES',
		});
	});
};

export {
	pinArticle,
	pinEpisode,
	unpinEpisode,
	unpinArticle,
	getPinnedArticles,
	getPinnedEpisodes,
};
