import moment from 'moment';

export default (previousState = {}, action) => {
	if (action.type === 'DISMISS_INTRO_BANNER') {
		return { ...previousState, showIntroBanner: false };
	}

	if (action.type === 'UPDATE_COMMENT') {
		let serializedComment = { ...action.comment };

		serializedComment.user = serializedComment.user._id;
		serializedComment.share = serializedComment.share._id;

		return {
			...previousState,
			comments: {
				...previousState.comments,
				[action.comment._id]: serializedComment,
			},
		};
	} else if (action.type === 'LIKE') {
		let reduxKey;

		if (action.objectType === 'share') {
			reduxKey = 'shares';
		} else if (action.objectType === 'playlist') {
			reduxKey = 'playlists';
		} else if (action.objectType === 'episode') {
			reduxKey = 'episodes';
		} else if (action.objectType === 'article') {
			reduxKey = 'articles';
		}

		return {
			...previousState,
			[reduxKey]: {
				...previousState[reduxKey],
				[action.objectID]: {
					...previousState[reduxKey][action.objectID],
					liked: true,
					likes:
						previousState[reduxKey][action.objectID] &&
						previousState[reduxKey][action.objectID].likes
							? previousState[reduxKey][action.objectID].likes + 1
							: 1,
				},
			},
		};
	} else if (action.type === 'UNLIKE') {
		let reduxKey;

		if (action.objectType === 'share') {
			reduxKey = 'shares';
		} else if (action.objectType === 'playlist') {
			reduxKey = 'playlists';
		} else if (action.objectType === 'episode') {
			reduxKey = 'episodes';
		} else if (action.objectType === 'article') {
			reduxKey = 'articles';
		}

		return {
			...previousState,
			[reduxKey]: {
				...previousState[reduxKey],
				[action.objectID]: {
					...previousState[reduxKey][action.objectID],
					liked: false,
					likes:
						previousState[reduxKey][action.objectID] &&
						previousState[reduxKey][action.objectID].likes
							? previousState[reduxKey][action.objectID].likes - 1
							: 0,
				},
			},
		};
	} else if (action.type === 'NEW_SHARE') {
		let newTimelineFeed;
		if (previousState.feeds[`timeline:${action.activity.user._id}`]) {
			newTimelineFeed = previousState.feeds[
				`timeline:${action.activity.user._id}`
			].slice();
		} else {
			newTimelineFeed = [];
		}

		newTimelineFeed.splice(0, 0, `share:${action.activity._id}`); // push the new foreign_id onto the front of the new timeline feed

		let newUserFeed;
		if (previousState.feeds[`user:${action.activity.user._id}`]) {
			newUserFeed = previousState.feeds[`user:${action.activity.user._id}`].slice();
		} else {
			newUserFeed = [];
		}

		newUserFeed.splice(0, 0, `share:${action.activity._id}`); // push the new foreign_id onto the front of the new timeline feed

		return {
			...previousState,
			feeds: {
				...previousState.feeds,
				[`timeline:${action.activity.user._id}`]: newTimelineFeed,
				[`user:${action.activity.user._id}`]: newUserFeed,
			},
		};
	} else if (action.type === 'TOGGLE_LIKE_ON_CURRENT_TRACK') {
		let userLikes;

		if ('likes' in previousState.user) {
			userLikes = previousState.user.likes;
		} else {
			userLikes = {};
		}

		if (previousState.currentlyPlaying.podcastEpisodeID in userLikes) {
			userLikes[previousState.currentlyPlaying.podcastEpisodeID] = !userLikes[
				previousState.currentlyPlaying.podcastEpisodeID
			];
		} else {
			userLikes[previousState.currentlyPlaying.podcastEpisodeID] = true;
		}

		let user = Object.assign({}, previousState.user, {
			likes: userLikes,
		});

		saveUserToLocalStorage(user);

		return Object.assign({}, previousState, { user });
	} else if (action.type === 'UPDATE_FEED') {
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
	} else if (action.type === 'UPDATE_SHARE') {
		return {
			...previousState,
			shares: {
				...previousState.shares,
				[action.share._id]: {
					...action.share,
					user: action.share.user._id,
				},
			},
		};
	} else if (action.type === 'UPDATE_USER') {
		let users = { ...previousState.users };
		users[action.user._id] = action.user;

		return Object.assign({}, previousState, {
			users,
		});
	} else if (action.type === 'UPDATE_FOLLOWING_USERS') {
		let existingFollowRelationships = { ...previousState.follows };
		let existingUsers = { ...previousState.users };

		for (let relationship of action.relationships) {
			let followingUserID = relationship.user._id;
			let followedUserID = relationship.followee._id;
			existingFollowRelationships[followingUserID] = {
				[followedUserID]: true,
				...existingFollowRelationships[followingUserID],
			};
			existingUsers[followedUserID] = {
				...existingUsers[followedUserID],
				...relationship.followee,
			};
			existingUsers[followingUserID] = {
				...existingUsers[followingUserID],
				...relationship.user,
			};
		}

		return {
			...previousState,
			follows: existingFollowRelationships,
			users: existingUsers,
		};
	} else if (action.type === 'UPDATE_FOLLOWING_USER') {
		let allFollows;

		if (previousState.follows) {
			allFollows = previousState.follows;
		} else {
			allFollows = {};
		}

		let otherUserFollows;
		if (allFollows[action.userID]) {
			otherUserFollows = { ...allFollows[action.userID] };
		} else {
			otherUserFollows = {};
		}

		return {
			...previousState,
			follows: {
				...allFollows,
				[action.userID]: {
					...otherUserFollows,
					[action.followeeID]: true,
				},
			},
		};
	} else if (action.type === 'FOLLOW_USER') {
		let existingFollowRelationships = { ...previousState.follows };
		let followObject = { [action.toUserID]: true };
		let followerObject = {
			[action.fromUserID]: {
				...existingFollowRelationships[action.fromUserID],
				...followObject,
			},
		};

		return {
			...previousState,
			follows: {
				...existingFollowRelationships,
				...followerObject,
			},
		};
	} else if (action.type === 'UNFOLLOW_USER') {
		let existingFollowRelationships = { ...previousState.follows };
		let followObject = { [action.toUserID]: false };
		let followerObject = {
			[action.fromUserID]: {
				...existingFollowRelationships[action.fromUserID],
				...followObject,
			},
		};

		return {
			...previousState,
			follows: {
				...existingFollowRelationships,
				...followerObject,
			},
		};
	} else if (action.type === 'UPDATE_PLAYLIST') {
		return {
			...previousState,
			playlists: {
				...previousState.playlists,
				[action.playlist._id]: {
					...action.playlist,
					episodes: action.playlist.episodes.map(episode => {
						return episode._id;
					}),
					user: action.playlist.user._id,
				},
			},
		};
	} else if (action.type === 'UPDATE_PLAYLIST_ORDER') {
		return {
			...previousState,
			playlists: {
				...previousState.playlists,
				[action.playlistID]: {
					...previousState.playlists[action.playlistID],
					episodes: action.newOrder,
				},
			},
		};
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
			let previous = previousState.articles && previousState.articles[article.duplicateOf];
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
		let original = action.rssFeed.duplicateOf && previousState.rssFeeds && previousState.rssFeeds[action.rssFeed.duplicateOf];
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
			let previous = previousState.rssFeeds && previousState.rssFeeds[rssFeed.duplicateOf];
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
	} else if (action.type === 'SET_FEATURED_PLAYLIST') {
		return { ...previousState, featuredPlaylist: action.playlistID };
	} else if (action.type === 'UPDATE_SUGGESTED_USERS') {
		let users = { ...previousState.users };
		for (let updatedUser of action.users) {
			users[updatedUser._id] = updatedUser;
		}

		let suggestions = { ...previousState.suggestions };
		suggestions.users = action.users.map(suggestedUser => {
			return suggestedUser._id;
		});

		return Object.assign({}, previousState, {
			suggestions,
			users,
		});
	} else if (action.type === 'UPDATE_SUGGESTED_PODCASTS') {
		let podcastIDs = action.podcasts.map(podcast => {
			return podcast._id;
		});

		return { ...previousState, suggestedPodcasts: podcastIDs };
	} else if (action.type === 'UPDATE_SUGGESTED_PLAYLISTS') {
		return { ...previousState, suggestedPlaylists: action.playlistIDs };
	} else if (action.type === 'UPDATE_SUGGESTED_RSS_FEEDS') {
		let rssFeedIDs = action.rssFeeds.map(rssFeed => {
			return rssFeed._id;
		});

		return { ...previousState, suggestedRssFeeds: rssFeedIDs };
	} else if (action.type === 'UPDATE_PODCAST_FOLLOWER') {
		let userFollows = {};

		if (!previousState.followedPodcasts) {
			userFollows = {
				[action.followRelationship.podcast._id]: true,
			};
		} else {
			userFollows = {
				...previousState.followedPodcasts[action.followRelationship.user._id],
				[action.followRelationship.podcast._id]: true,
			};
		}

		return {
			...previousState,
			followedPodcasts: {
				...previousState.followedPodcasts,
				[action.followRelationship.user._id]: userFollows,
			},
		};
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
	} else if (action.type === 'DELETE_PLAYLIST') {
		let playlists = { ...previousState.playlists };
		delete playlists[action.playlistID];

		return { ...previousState, playlists };
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
	} else {
		return previousState;
	}
};

let saveUserToLocalStorage = userObject => {
	localStorage['user'] = JSON.stringify(userObject);
};
