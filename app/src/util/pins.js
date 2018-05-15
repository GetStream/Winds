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
		for (let pin of response.data) {
			// dispatch update to rss feeds
			dispatch({
				rssFeed: pin.article.rss,
				type: 'UPDATE_RSS_FEED',
			});
			// dispatch updates to articles
			dispatch({
				rssArticle: { ...pin.article, type: 'article' },
				type: 'UPDATE_ARTICLE',
			});
			// dispatch updates to pins
			dispatch({
				pin,
				type: 'PIN_ARTICLE',
			});
		}
	});
};

export { pinArticle, unpinArticle, getPinnedArticles };
