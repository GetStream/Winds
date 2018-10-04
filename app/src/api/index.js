import fetch from '../util/fetch';
import { getPinnedArticles, getPinnedEpisodes } from '../util/pins';

export const getUser = (dispatch, userId) => {
	fetch('GET', `/users/${userId}`)
		.then((res) => {
			window.streamAnalyticsClient.setUser({
				id: res.data._id,
				alias: res.data.email,
			});

			dispatch({
				type: 'UPDATE_USER',
				user: res.data,
			});
		})
		.catch((err) => {
			if (
				err.response &&
				(err.response.status === 401 || err.response.status === 404)
			) {
				localStorage.clear();
				window.location = '/';
			}
		});
};

export const getAliases = (dispatch) => {
	fetch('GET', '/aliases')
		.then(({ data }) => {
			const aliases = data.reduce((result, { _id, alias, podcast, rss }) => {
				const feedID = podcast ? podcast._id : rss._id;
				result[feedID] = { _id, alias };
				return result;
			}, {});

			dispatch({
				aliases,
				type: 'BATCH_UPDATE_ALIASES',
			});
		})
		.catch((err) => {
			console.log(err); // eslint-disable-line no-console
		});
};

export const getSuggestedRss = (dispatch) => {
	fetch('GET', '/rss', {}, { type: 'recommended' })
		.then((res) => {
			dispatch({
				rssFeeds: res.data,
				type: 'UPDATE_SUGGESTED_RSS_FEEDS',
			});
		})
		.catch((err) => {
			console.log(err); // eslint-disable-line no-console
		});
};

export const getSuggestedPodcasts = (dispatch) => {
	fetch('GET', '/podcasts', {}, { type: 'recommended' })
		.then((res) => {
			dispatch({
				podcasts: res.data,
				type: 'UPDATE_SUGGESTED_PODCASTS',
			});
		})
		.catch((err) => {
			console.log(err); // eslint-disable-line no-console
		});
};

export const getRssById = (dispatch, id) => {
	fetch('GET', `/rss/${id}`)
		.then((res) => {
			if (res.data.duplicateOf) return fetch('GET', `/rss/${res.data.duplicateOf}`);
			return res;
		})
		.then((response) => {
			dispatch({
				rssFeed: response.data,
				type: 'UPDATE_RSS_FEED',
			});
		});
};

export const getPodcastById = (dispatch, id) => {
	fetch('GET', `/podcasts/${id}`)
		.then((res) => {
			dispatch({
				podcast: res.data,
				type: 'UPDATE_PODCAST_SHOW',
			});
		})
		.catch((err) => {
			console.log(err); // eslint-disable-line no-console
		});
};

export const getPodcastEpisodes = (podcastID) => {
	fetch(
		'GET',
		'/episodes',
		{},
		{
			podcast: podcastID,
			sort_by: 'publicationDate,desc',
		},
	)
		.then((res) =>
			this.props.dispatch({
				episodes: res.data,
				type: 'BATCH_UPDATE_EPISODES',
			}),
		)
		.catch((err) => {
			console.log(err); // eslint-disable-line no-console
		});
};

export const getRssFollows = (dispatch) => {
	fetch('GET', '/follows', null, { type: 'rss' })
		.then((res) => {
			dispatch({
				rssFeeds: res.data,
				type: 'BATCH_UPDATE_RSS_FEEDS',
			});
			dispatch({
				follows: res.data,
				type: 'BATCH_FOLLOW_RSS_FEEDS',
			});
		})
		.catch((err) => {
			console.log(err); // eslint-disable-line no-console
		});
};

export const getPodcastsFollows = (dispatch) => {
	fetch('GET', '/follows', null, { type: 'podcast' })
		.then((res) => {
			dispatch({
				podcasts: res.data,
				type: 'BATCH_UPDATE_PODCASTS',
			});
			dispatch({
				follows: res.data,
				type: 'BATCH_FOLLOW_PODCASTS',
			});
		})
		.catch((err) => {
			console.log(err); // eslint-disable-line no-console
		});
};

export const getFeatured = (dispatch) => {
	fetch('GET', '/featured').then((res) => {
		dispatch({
			featuredItems: res.data,
			type: 'UPDATE_FEATURED_ITEMS',
		});
	});
};

export const followRss = (dispatch, rssFeedID) => {
	dispatch({ rssFeedID, type: 'FOLLOW_RSS_FEED' });

	fetch('POST', '/follows', {}, { rss: rssFeedID, type: 'rss' }).catch((err) => {
		console.log(err); // eslint-disable-line no-console
		dispatch({ rssFeedID, type: 'UNFOLLOW_RSS_FEED' });
	});
};

export const unfollowRss = (dispatch, rssFeedID) => {
	dispatch({ rssFeedID, type: 'UNFOLLOW_RSS_FEED' });

	fetch('DELETE', '/follows', {}, { rss: rssFeedID, type: 'rss' }).catch((err) => {
		console.log(err); // eslint-disable-line no-console
		dispatch({ rssFeedID, type: 'FOLLOW_RSS_FEED' });
	});
};

export const followPodcast = (dispatch, podcastID) => {
	dispatch({ podcastID, type: 'FOLLOW_PODCAST' });

	fetch('POST', '/follows', null, { podcast: podcastID, type: 'podcast' }).catch(
		(err) => {
			console.log(err); // eslint-disable-line no-console
			dispatch({ podcastID, type: 'UNFOLLOW_PODCAST' });
		},
	);
};

export const unfollowPodcast = (dispatch, podcastID) => {
	dispatch({ podcastID, type: 'UNFOLLOW_PODCAST' });
	fetch('DELETE', '/follows', null, { podcast: podcastID, type: 'podcast' }).catch(
		(err) => {
			console.log(err); // eslint-disable-line no-console
			dispatch({ podcastID, type: 'FOLLOW_PODCAST' });
		},
	);
};

export const getAllData = (dispatch) => {
	const userId = localStorage['authedUser'];
	if (userId) {
		getUser(dispatch, userId);
		getAliases(dispatch);
		getPinnedArticles(dispatch);
		getPinnedEpisodes(dispatch);
		getRssFollows(dispatch);
		getPodcastsFollows(dispatch);
	}
};
