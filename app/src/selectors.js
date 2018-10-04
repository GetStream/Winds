const getActivity = (state, activityID) => {
	let activity;
	let [type, Id] = activityID.split(':');

	if (type === 'episode') {
		activity = { ...state.episodes[Id] };
		activity.podcast = { ...state.podcasts[activity.podcast] };
		activity.type = 'episode';
	} else if (type === 'share') {
		activity = { ...state.shares[Id] };
		activity.user = { ...state.user };
		activity.type = 'share';
	} else if (type === 'article') {
		activity = { ...state.articles[Id] };
		activity.rss = { ...state.rssFeeds[activity.rss] };
		activity.type = 'article';
	}

	return activity;
};

const getPlaylistsForUser = (state, userID) => {
	let playlists = [];

	for (let playlistID in state.playlists) {
		if (state.playlists.hasOwnProperty(playlistID)) {
			if (state.playlists[playlistID].user === userID) {
				playlists.push({ ...state.playlists[playlistID] });
			}
		}
	}

	for (let playlist of playlists) {
		let hydratedEpisodes = playlist.episodes.map((episodeID) => {
			return { ...state.episodes[episodeID] };
		});
		playlist.episodes = hydratedEpisodes;
	}

	return playlists;
};

const getEpisode = (state, episodeID) => {
	return {
		...state.episodes[episodeID],
		podcast: state.podcasts[state.episodes[episodeID].podcast],
	};
};

const getArticle = (state, articleID) => {
	return {
		...state.articles[articleID],
		rss: { ...state.rssFeeds[state.articles[articleID].rss] },
	};
};

export { getActivity, getPlaylistsForUser, getEpisode, getArticle };
