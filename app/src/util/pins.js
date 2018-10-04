import fetch from '../util/fetch';

const unpinArticle = (pinID, articleID, dispatch) => {
	fetch('DELETE', `/pins/${pinID}`)
		.then(() => {
			dispatch({
				articleID,
				type: 'UNPIN_ARTICLE',
			});
		})
		.catch((err) => {
			console.log(err); // eslint-disable-line no-console
		});
};

const pinArticle = (articleID, dispatch) => {
	window.streamAnalyticsClient.trackEngagement({
		label: 'pinned_article',
		content: { foreign_id: `articles:${articleID}` },
	});

	fetch('POST', '/pins', { article: articleID })
		.then((res) => {
			dispatch({
				pin: res.data,
				type: 'PIN_ARTICLE',
			});
		})
		.catch((err) => {
			console.log(err); // eslint-disable-line no-console
		});
};

const pinEpisode = (episodeID, dispatch) => {
	window.streamAnalyticsClient.trackEngagement({
		label: 'pinned_episode',
		content: { foreign_id: `episodes:${episodeID}` },
	});

	fetch('POST', '/pins', { episode: episodeID })
		.then((res) => {
			dispatch({
				pin: res.data,
				type: 'PIN_EPISODE',
			});
		})
		.catch((err) => {
			console.log(err); // eslint-disable-line no-console
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
		.catch((err) => {
			console.log(err); // eslint-disable-line no-console
		});
};

const getPinnedArticles = (dispatch) => {
	fetch('GET', '/pins', null, { type: 'article' })
		.then((res) => {
			dispatch({
				pins: res.data,
				type: 'BATCH_PIN_ARTICLES',
			});
		})
		.catch((err) => {
			console.log(err); // eslint-disable-line no-console
		});
};

const getPinnedEpisodes = (dispatch) => {
	fetch('GET', '/pins', null, { type: 'episode' })
		.then((res) => {
			dispatch({
				pins: res.data,
				type: 'BATCH_PIN_EPISODES',
			});
		})
		.catch((err) => {
			console.log(err); // eslint-disable-line no-console
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
