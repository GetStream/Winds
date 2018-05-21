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
			console.log(err); // eslint-disable-line no-console
		});
};

const pinArticle = (articleID, dispatch) => {
	fetch('POST', '/pins', {
		article: articleID,
	})
		.then(response => {
			dispatch({
				pin: response.data,
				type: 'PIN_ARTICLE',
			});
		})
		.catch(err => {
			console.log(err); // eslint-disable-line no-console
		});
};

const getPinnedArticles = dispatch => {
	fetch('GET', '/pins', null, {
		type: 'article',
		user: localStorage['authedUser'],
	}).then(response => {
		// for (let pin of response.data) {
		// 	// dispatch update to rss feeds
		// 	dispatch({
		// 		rssFeed: pin.article.rss,
		// 		type: 'UPDATE_RSS_FEED',
		// 	});
		// 	// dispatch updates to articles
		// 	dispatch({
		// 		rssArticle: { ...pin.article, type: 'article' },
		// 		type: 'UPDATE_ARTICLE',
		// 	});
		// 	// dispatch updates to pins
		// 	dispatch({
		// 		pin,
		// 		type: 'PIN_ARTICLE',
		// 	});
		// }

		let rssFeeds = [];
		let articles = [];
		for (let pin of response.data) {
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
			pins: response.data,
			type: 'BATCH_PIN_ARTICLES',
		});
	});
};

const getPinnedEpisodes = dispatch => {
	fetch('GET', '/pins', null, { type: 'episode' }).then(response => {
		let podcasts = [];
		let episodes = [];
		for (let pin of response.data) {
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
			pins: response.data,
			type: 'BATCH_PIN_EPISODES',
		});
	});
};

export { pinArticle, unpinArticle, getPinnedArticles, getPinnedEpisodes };
