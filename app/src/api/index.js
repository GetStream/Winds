import fetch from '../util/fetch';

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
			if (window.console) console.log(err); // eslint-disable-line no-console
		});
};

export const getRss = (dispatch, type = 'recommended') => {
	fetch('GET', '/rss', {}, { type })
		.then((res) => {
			dispatch({
				rssFeeds: res.data,
				type: 'BATCH_UPDATE_RSS_FEEDS',
			});
			dispatch({
				rssFeeds: res.data,
				type: 'UPDATE_SUGGESTED_RSS_FEEDS',
			});
		})
		.catch((err) => {
			if (window.console) console.log(err); // eslint-disable-line no-console
		});
};

export const getRssById = (dispatch, id) => {
	fetch('get', `/rss/${id}`)
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

export const getPodcasts = (dispatch, type = 'recommended') => {
	fetch('GET', '/podcasts', {}, { type })
		.then((res) => {
			dispatch({
				podcasts: res.data,
				type: 'BATCH_UPDATE_PODCASTS',
			});
			dispatch({
				podcasts: res.data,
				type: 'UPDATE_SUGGESTED_PODCASTS',
			});
		})
		.catch((err) => {
			if (window.console) console.log(err); // eslint-disable-line no-console
		});
};

export const getPodcastById = (dispatch, id) => {
	fetch('get', `/podcasts/${id}`)
		.then((res) => {
			dispatch({
				podcast: res.data,
				type: 'UPDATE_PODCAST_SHOW',
			});
		})
		.catch((err) => {
			if (window.console) console.log(err); // eslint-disable-line no-console
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
			if (window.console) console.log(err); // eslint-disable-line no-console
		});
};

export const getRssFollows = (dispatch) => {
	fetch('GET', '/follows', null, { type: 'rss' })
		.then((res) => {
			let rssFeeds = [];
			let rssFeedFollowRelationships = [];
			for (let followRelationship of res.data) {
				rssFeeds.push(followRelationship.rss);
				rssFeedFollowRelationships.push({
					rssFeedID: followRelationship.rss._id,
					userID: followRelationship.user._id,
				});
			}

			dispatch({
				rssFeeds,
				type: 'BATCH_UPDATE_RSS_FEEDS',
			});
			dispatch({
				rssFeedFollowRelationships,
				type: 'BATCH_FOLLOW_RSS_FEEDS',
			});
		})
		.catch((err) => {
			if (window.console) console.log(err); // eslint-disable-line no-console
		});
};

export const getPodcastsFollows = (dispatch) => {
	fetch('GET', '/follows', null, { type: 'podcast' })
		.then((res) => {
			let podcasts = [];
			let podcastFollowRelationships = [];

			for (let followRelationship of res.data) {
				podcasts.push(followRelationship.podcast);
				podcastFollowRelationships.push({
					podcastID: followRelationship.podcast._id,
					userID: followRelationship.user._id,
				});
			}

			dispatch({
				podcasts,
				type: 'BATCH_UPDATE_PODCASTS',
			});

			dispatch({
				podcastFollowRelationships,
				type: 'BATCH_FOLLOW_PODCASTS',
			});
		})
		.catch((err) => {
			if (window.console) console.log(err); // eslint-disable-line no-console
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
