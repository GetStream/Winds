import fetch from './fetch';

const getEpisodesFeed = (dispatch, page = 0, per_page = 10) => {
	fetch('GET', `/users/${localStorage['authedUser']}/feeds`, null, {
		page,
		per_page,
		type: 'episode',
	}).then(response => {
		let episodes = response.data.map(episode => {
			return { ...episode, type: 'episode' };
		});

		for (let episode of episodes) {
			if (episode._id) {
				// update podcast
				dispatch({
					podcast: episode.podcast,
					type: 'UPDATE_PODCAST_SHOW',
				});
				// update episode
				dispatch({
					episode,
					type: 'UPDATE_EPISODE',
				});
			} else {
				return;
			}
		}

		dispatch({
			activities: episodes,
			feedID: `user_episode:${localStorage['authedUser']}`,
			type: 'UPDATE_FEED',
		});
	});
};

export { getEpisodesFeed };
