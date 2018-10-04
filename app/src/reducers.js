import moment from 'moment';

export default (previousState = {}, action) => {
	if (action.type === 'UPDATE_USER') {
		return { ...previousState, user: { ...action.user } };
	} else if (action.type === 'UPDATE_EPISODE') {
		let episode = { ...action.episode };
		episode.podcast = episode.podcast._id;
		episode.favicon = episode.images ? episode.images.favicon : null;

		let episodes = { ...previousState.episodes };
		episodes[episode._id] = episode;

		return { ...previousState, episodes };
	} else if (action.type === 'BATCH_UPDATE_EPISODES') {
		let episodes = action.episodes.reduce((result, item) => {
			result[item._id] = {
				...item,
				type: 'episode',
				favicon: item.podcast.images ? item.podcast.images.favicon : null,
			};
			return result;
		}, {});

		episodes = { ...previousState.episodes, ...episodes };

		const order = Object.values(episodes)
			.sort((a, b) => {
				return (
					moment(b.publicationDate).valueOf() -
					moment(a.publicationDate).valueOf()
				);
			})
			.map((episode) => episode._id);

		return {
			...previousState,
			episodes,
			feeds: {
				...previousState.feeds,
				episode: order,
			},
		};
	} else if (action.type === 'BATCH_UPDATE_ARTICLES') {
		let articles = action.articles.reduce((result, item) => {
			result[item._id] = {
				...item,
				type: 'article',
				favicon: item.rss.images ? item.rss.images.favicon : null,
			};
			return result;
		}, {});

		// TODO: Refactor
		for (let article in articles) {
			if (!article.duplicateOf) continue;
			const previous =
				previousState.articles && previousState.articles[article.duplicateOf];
			const next = articles[article.duplicateOf];
			articles[article._id] = next || previous || article;
		}

		articles = { ...previousState.articles, ...articles };

		const order = Object.values(articles)
			.sort((a, b) => {
				return (
					moment(b.publicationDate).valueOf() -
					moment(a.publicationDate).valueOf()
				);
			})
			.map((article) => article._id);

		return {
			...previousState,
			articles,
			feeds: {
				...previousState.feeds,
				article: order,
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
		const podcasts = action.podcasts.reduce((result, item) => {
			result[item.podcast._id] = item.podcast;
			return result;
		}, {});

		return { ...previousState, podcasts };
	} else if (action.type === 'PLAY_EPISODE') {
		let player = { ...action, playing: true };
		delete player.type;
		return { ...previousState, player };
	} else if (action.type === 'PAUSE_EPISODE') {
		return {
			...previousState,
			player: { ...previousState.player, playing: false },
		};
	} else if (action.type === 'RESUME_EPISODE') {
		return {
			...previousState,
			player: { ...previousState.player, playing: true },
		};
	} else if (action.type === 'CLEAR_PLAYER') {
		let existingState = { ...previousState };
		delete existingState.player;
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
		const rssFeeds = action.rssFeeds.reduce((result, item) => {
			result[item.rss._id] = item.rss;
			return result;
		}, {});

		// TODO: Refactor
		for (let rssFeed in rssFeeds) {
			if (!rssFeed.duplicateOf) continue;
			const previous =
				previousState.rssFeeds && previousState.rssFeeds[rssFeed.duplicateOf];
			const next = rssFeeds[rssFeed.duplicateOf];
			rssFeeds[rssFeed._id] = next || previous || rssFeed;
		}

		return { ...previousState, rssFeeds };
	} else if (action.type === 'UPDATE_ARTICLE') {
		let articles = { ...previousState.articles };
		articles[action.rssArticle._id] = { ...action.rssArticle };
		articles[action.rssArticle._id]['rss'] = action.rssArticle.rss._id;
		articles[action.rssArticle._id]['favicon'] = action.rssArticle.rssimages
			? action.rssArticle.rssimages.favicon
			: null;

		return { ...previousState, articles };
	} else if (action.type === 'UPDATE_SUGGESTED_PODCASTS') {
		return { ...previousState, suggestedPodcasts: [...action.podcasts] };
	} else if (action.type === 'UPDATE_SUGGESTED_RSS_FEEDS') {
		return { ...previousState, suggestedRssFeeds: [...action.rssFeeds] };
	} else if (action.type === 'FOLLOW_PODCAST') {
		const followedPodcasts = { ...previousState.followedPodcasts } || {};
		followedPodcasts[action.podcastID] = true;

		return { ...previousState, followedPodcasts };
	} else if (action.type === 'BATCH_FOLLOW_PODCASTS') {
		const followedPodcasts = action.follows.reduce((result, follow) => {
			result[follow.podcast._id] = true;
			return result;
		}, {});

		return { ...previousState, followedPodcasts };
	} else if (action.type === 'BATCH_FOLLOW_RSS_FEEDS') {
		const followedRssFeeds = action.follows.reduce((result, follow) => {
			result[follow.rss._id] = true;
			return result;
		}, {});

		return { ...previousState, followedRssFeeds };
	} else if (action.type === 'UNFOLLOW_PODCAST') {
		const followedPodcasts = { ...previousState.followedPodcasts } || {};
		followedPodcasts[action.podcastID] = false;

		return { ...previousState, followedPodcasts };
	} else if (action.type === 'PIN_EPISODE') {
		return {
			...previousState,
			pinnedEpisodes: {
				...previousState.pinnedEpisodes,
				[action.pin.episode._id]: { ...action.pin },
			},
		};
	} else if (action.type === 'BATCH_PIN_EPISODES') {
		const pinnedEpisodes = action.pins.reduce((result, pin) => {
			result[pin.episode._id] = { ...pin };
			return result;
		}, {});

		return { ...previousState, pinnedEpisodes };
	} else if (action.type === 'UNPIN_EPISODE') {
		let allPins = { ...previousState.pinnedEpisodes };
		delete allPins[action.episodeID];

		return { ...previousState, pinnedEpisodes: allPins };
	} else if (action.type === 'PIN_ARTICLE') {
		return {
			...previousState,
			pinnedArticles: {
				...previousState.pinnedArticles,
				[action.pin.article._id]: { ...action.pin },
			},
		};
	} else if (action.type === 'BATCH_PIN_ARTICLES') {
		const pinnedArticles = action.pins.reduce((result, pin) => {
			result[pin.article._id] = { ...pin };
			return result;
		}, {});

		return { ...previousState, pinnedArticles };
	} else if (action.type === 'UNPIN_ARTICLE') {
		let allPins = { ...previousState.pinnedArticles };
		delete allPins[action.articleID];

		return { ...previousState, pinnedArticles: allPins };
	} else if (action.type === 'FOLLOW_RSS_FEED') {
		const followedRssFeeds = { ...previousState.followedRssFeeds } || {};
		followedRssFeeds[action.rssFeedID] = true;

		return { ...previousState, followedRssFeeds };
	} else if (action.type === 'UNFOLLOW_RSS_FEED') {
		const followedRssFeeds = { ...previousState.followedRssFeeds } || {};
		followedRssFeeds[action.rssFeedID] = false;

		return { ...previousState, followedRssFeeds };
	} else if (action.type === 'UPDATE_FEATURED_ITEMS') {
		return { ...previousState, featuredItems: [...action.featuredItems] };
	} else if (action.type === 'BATCH_UPDATE_ALIASES') {
		return { ...previousState, aliases: { ...action.aliases } };
	} else return previousState;
};
