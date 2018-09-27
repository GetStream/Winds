import moment from 'moment';

export default (previousState = {}, action) => {
	if (action.type === 'UPDATE_FEED') {
		let feedItems = [];

		if (previousState.feeds && previousState.feeds[action.feedID]) {
			feedItems = [...previousState.feeds[action.feedID]] || [];
		}

		for (let newFeedItem of action.activities) {
			if (!feedItems.includes(newFeedItem._id)) {
				feedItems.push(newFeedItem._id);
			}
		}

		return {
			...previousState,
			feeds: {
				...previousState.feeds,
				[action.feedID]: feedItems,
			},
		};
	} else if (action.type === 'UPDATE_USER') {
		let users = { ...previousState.users };
		users[action.user._id] = action.user;

		return Object.assign({}, previousState, {
			users,
		});
	} else if (action.type === 'UPDATE_EPISODE') {
		let episode = { ...action.episode };
		episode.podcast = action.episode.podcast._id;
		let episodes = { ...previousState.episodes };
		episodes[episode._id] = episode;

		return { ...previousState, episodes };
	} else if (action.type === 'BATCH_UPDATE_EPISODES') {
		let previousEpisodes = { ...previousState.episodes };

		for (let episode of action.episodes) {
			previousEpisodes[episode._id] = {
				...episode,
				podcast: episode.podcast._id,
			};
		}

		return {
			...previousState,
			episodes: { ...previousEpisodes },
		};
	} else if (action.type === 'BATCH_UPDATE_ARTICLES') {
		let newArticles = {};

		for (let article of action.articles) {
			newArticles[article._id] = {
				...article,
				rss: article.rss._id,
			};
		}
		for (let article of action.articles) {
			if (!article.duplicateOf) {
				continue;
			}
			let previous =
				previousState.articles && previousState.articles[article.duplicateOf];
			let next = newArticles[article.duplicateOf];
			newArticles[article._id] = next || previous || article;
		}

		return {
			...previousState,
			articles: {
				...previousState.articles,
				...newArticles,
			},
		};
	} else if (action.type === 'UPDATE_PODCAST_SHOW') {
		return {
			...previousState,
			podcasts: {
				...previousState.podcasts,
				[action.podcast._id]: { ...action.podcast },
			},
		};
	} else if (action.type === 'BATCH_UPDATE_PODCASTS') {
		let newPodcasts = {};

		for (let podcast of action.podcasts) {
			newPodcasts[podcast._id] = podcast;
		}

		return {
			...previousState,
			podcasts: {
				...previousState.podcasts,
				...newPodcasts,
			},
		};
	} else if (action.type === 'PLAY_EPISODE') {
		let player = { ...action, playing: true };
		delete player.type;
		return { ...previousState, player };
	} else if (action.type === 'PAUSE_EPISODE') {
		return {
			...previousState,
			player: {
				...previousState.player,
				playing: false,
			},
		};
	} else if (action.type === 'RESUME_EPISODE') {
		return {
			...previousState,
			player: {
				...previousState.player,
				playing: true,
			},
		};
	} else if (action.type === 'NEXT_TRACK') {
		let existingState = { ...previousState };
		let player = { ...previousState.player };

		if (existingState.player.contextType === 'playlist') {
			if (
				player.contextPosition + 1 >=
				existingState.playlists[player.contextID].episodes.length
			) {
				delete existingState.player;
			} else {
				player.episodeID =
					existingState.playlists[player.contextID].episodes[
						player.contextPosition + 1
					];
				player.contextPosition += 1;
				existingState.player = player;
			}
		} else if (existingState.player.contextType === 'podcast') {
			// build a sorted array of podcast episodes
			let episodes = Object.values(existingState.episodes).filter(episode => {
				// only return the episodes where the podcast ID matches the parent ID
				return episode.podcast === player.contextID;
			});
			episodes.sort((a, b) => {
				return (
					moment(b.publicationDate).valueOf() -
					moment(a.publicationDate).valueOf()
				);
			});

			if (player.contextPosition + 1 >= episodes.length) {
				delete existingState.player;
			} else {
				player.episodeID = episodes[player.contextPosition + 1]._id;
				player.contextPosition += 1;
				existingState.player = player;
			}
		}

		return { ...existingState };
	} else if (action.type === 'UPDATE_RSS_FEED') {
		let original =
			action.rssFeed.duplicateOf &&
			previousState.rssFeeds &&
			previousState.rssFeeds[action.rssFeed.duplicateOf];
		return {
			...previousState,
			rssFeeds: {
				...previousState.rssFeeds,
				[action.rssFeed._id]: original || action.rssFeed,
			},
		};
	} else if (action.type === 'BATCH_UPDATE_RSS_FEEDS') {
		let newRssFeeds = {};

		for (let rssFeed of action.rssFeeds) {
			newRssFeeds[rssFeed._id] = rssFeed;
		}
		for (let rssFeed of action.rssFeeds) {
			if (!rssFeed.duplicateOf) {
				continue;
			}
			let previous =
				previousState.rssFeeds && previousState.rssFeeds[rssFeed.duplicateOf];
			let next = newRssFeeds[rssFeed.duplicateOf];
			newRssFeeds[rssFeed._id] = next || previous || rssFeed;
		}

		return {
			...previousState,
			rssFeeds: {
				...previousState.rssFeeds,
				...newRssFeeds,
			},
		};
	} else if (action.type === 'UPDATE_ARTICLE') {
		let articles = { ...previousState.articles };
		articles[action.rssArticle._id] = { ...action.rssArticle };
		articles[action.rssArticle._id]['rss'] = action.rssArticle.rss._id;

		return { ...previousState, articles };
	} else if (action.type === 'UPDATE_SUGGESTED_PODCASTS') {
		let podcastIDs = action.podcasts.map(podcast => {
			return podcast._id;
		});

		return { ...previousState, suggestedPodcasts: podcastIDs };
	} else if (action.type === 'UPDATE_SUGGESTED_RSS_FEEDS') {
		let rssFeedIDs = action.rssFeeds.map(rssFeed => {
			return rssFeed._id;
		});

		return { ...previousState, suggestedRssFeeds: rssFeedIDs };
	} else if (action.type === 'FOLLOW_PODCAST') {
		let userFollows = {};

		if (!previousState.followedPodcasts) {
			userFollows = {
				[action.podcastID]: true,
			};
		} else {
			userFollows = {
				...previousState.followedPodcasts[action.userID],
				[action.podcastID]: true,
			};
		}

		return {
			...previousState,
			followedPodcasts: {
				...previousState.followedPodcasts,
				[action.userID]: userFollows,
			},
		};
	} else if (action.type === 'BATCH_FOLLOW_PODCASTS') {
		let previousPodcastFollows = { ...(previousState.followedPodcasts || {}) };

		for (let followRelationship of action.podcastFollowRelationships) {
			// followRelationship.podcastID
			// followRelationship.userID
			if (!(followRelationship.userID in previousPodcastFollows)) {
				// create new object just for that user/podcast
				previousPodcastFollows[followRelationship.userID] = {
					[followRelationship.podcastID]: true,
				};
			} else {
				// just add new key for that user/podcast
				previousPodcastFollows[followRelationship.userID][
					followRelationship.podcastID
				] = true;
			}
		}

		return {
			...previousState,
			followedPodcasts: {
				...previousPodcastFollows,
			},
		};
	} else if (action.type === 'BATCH_FOLLOW_RSS_FEEDS') {
		let previousRssFeedFollows = { ...(previousState.followedRssFeeds || {}) };

		for (let followRelationship of action.rssFeedFollowRelationships) {
			if (!(followRelationship.userID in previousRssFeedFollows)) {
				previousRssFeedFollows[followRelationship.userID] = {
					[followRelationship.rssFeedID]: true,
				};
			} else {
				previousRssFeedFollows[followRelationship.userID][
					followRelationship.rssFeedID
				] = true;
			}
		}

		return { ...previousState, followedRssFeeds: { ...previousRssFeedFollows } };
	} else if (action.type === 'UNFOLLOW_PODCAST') {
		let userFollows = {};

		if (!previousState.followedPodcasts) {
			userFollows = {
				[action.podcastID]: false,
			};
		} else {
			userFollows = {
				...previousState.followedPodcasts[action.userID],
				[action.podcastID]: false,
			};
		}

		return {
			...previousState,
			followedPodcasts: {
				...previousState.followedPodcasts,
				[action.userID]: userFollows,
			},
		};
	} else if (action.type === 'PIN_EPISODE') {
		let pin = {
			...action.pin,
			episode: action.pin.episode._id,
			user: action.pin.user._id,
		};

		return {
			...previousState,
			pinnedEpisodes: {
				...previousState.pinnedEpisodes,
				[pin.episode]: pin,
			},
		};
	} else if (action.type === 'BATCH_PIN_EPISODES') {
		let newPinnedEpisodes = {};

		for (let pin of action.pins) {
			newPinnedEpisodes[pin.episode._id] = {
				...pin,
				episode: pin.episode._id,
				user: pin.user._id,
			};
		}

		return {
			...previousState,
			pinnedEpisodes: {
				...previousState.pinnedEpisodes,
				...newPinnedEpisodes,
			},
		};
	} else if (action.type === 'UNPIN_EPISODE') {
		let allPins = { ...previousState.pinnedEpisodes };
		delete allPins[action.episodeID];

		return {
			...previousState,
			pinnedEpisodes: allPins,
		};
	} else if (action.type === 'PIN_ARTICLE') {
		let pin = {
			...action.pin,
			article: action.pin.article._id,
			user: action.pin.user._id,
		};

		return {
			...previousState,
			pinnedArticles: {
				...previousState.pinnedArticles,
				[pin.article]: pin,
			},
		};
	} else if (action.type === 'BATCH_PIN_ARTICLES') {
		let newPinnedArticles = {};

		for (let pin of action.pins) {
			newPinnedArticles[pin.article._id] = {
				...pin,
				article: pin.article._id,
				user: pin.user._id,
			};
		}

		return {
			...previousState,
			pinnedArticles: {
				...previousState.pinnedArticles,
				...newPinnedArticles,
			},
		};
	} else if (action.type === 'UNPIN_ARTICLE') {
		let allPins = { ...previousState.pinnedArticles };
		delete allPins[action.articleID];

		return {
			...previousState,
			pinnedArticles: allPins,
		};
	} else if (action.type === 'UPDATE_USER_SETTINGS') {
		let userSettings = { ...previousState.userSettings };
		userSettings.preferences = action.user.preferences;

		return { ...previousState, userSettings };
	} else if (action.type === 'FOLLOW_RSS_FEED') {
		let userFollows = {};

		if (
			previousState.followedRssFeeds &&
			previousState.followedRssFeeds[action.userID]
		) {
			userFollows = { ...previousState.followedRssFeeds[action.userID] };
		}

		userFollows[action.rssFeedID] = true;

		return {
			...previousState,
			followedRssFeeds: {
				...(previousState.followedRssFeeds || {}),
				[action.userID]: userFollows,
			},
		};
	} else if (action.type === 'UNFOLLOW_RSS_FEED') {
		let userFollows = {};

		if (
			previousState.followedRssFeeds &&
			previousState.followedRssFeeds[action.userID]
		) {
			userFollows = { ...previousState.followedRssFeeds[action.userID] };
		}

		userFollows[action.rssFeedID] = false;

		return {
			...previousState,
			followedRssFeeds: {
				...(previousState.followedRssFeeds || {}),
				[action.userID]: userFollows,
			},
		};
	} else if (action.type === 'UPDATE_FEATURED_ITEMS') {
		return { ...previousState, featuredItems: [...action.featuredItemIDs] };
	} else if (action.type === 'BATCH_UPDATE_ALIASES') {
		return { ...previousState, aliases: { ...action.aliases } };
	} else return previousState;
};
