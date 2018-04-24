const getActivity = (state, activityID) => {
	let activity;
	let [type, Id] = activityID.split(':');
	if (type === 'episode') {
		activity = { ...state.episodes[Id] };
		activity.podcast = { ...state.podcasts[activity.podcast] };
		activity.type = 'episode';
	} else if (type === 'share') {
		activity = { ...state.shares[Id] };
		activity.user = { ...state.users[activity.user] };
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
				// ACHTUNG!
				// you have to create a new object to return for this selector....otherwise, there might be some modifications happening to the redux store :(
				playlists.push({ ...state.playlists[playlistID] });
			}
		}
	}
	for (let playlist of playlists) {
		let hydratedEpisodes = playlist.episodes.map(episodeID => {
			return { ...state.episodes[episodeID] };
		});
		playlist.episodes = hydratedEpisodes;
	}
	return playlists;
};

export { getActivity, getPlaylistsForUser };
