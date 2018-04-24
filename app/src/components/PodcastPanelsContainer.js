import {
	EverythingPodcastPanel,
	FollowSuggestionsPodcastPanel,
	PinsPodcastPanel,
	TodayPodcastPanel,
} from '../components/PodcastPanels';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import fetch from '../util/fetch';
import { getPlaylistsForUser } from '../selectors';

class PodcastPanelsContainer extends React.Component {
	componentDidMount() {
		this.props.getEpisodesFeed();
		this.props.getPodcastFollowSuggestions();
		this.props.getPinnedEpisodes();
		this.props.getPlaylists();
		this.addEpisodeToPlaylist = this.addEpisodeToPlaylist.bind(this);
	}
	addEpisodeToPlaylist(episodeID, playlistID) {
		// already have playlists as props - need to find the specific one, then call a PUT with the new episodes
		// get playlists from stateprops
		let targetPlaylist = this.props.playlists.find(playlist => {
			return playlist._id === playlistID;
		});
		let currentPlaylistIDs = targetPlaylist.episodes.map(episode => {
			return episode._id;
		});
		let playlistEpisodes = [...currentPlaylistIDs, episodeID];
		// then make an API call to update playlist episodes. then, make the dispatch call to update playlist.
		fetch('PUT', `/playlists/${playlistID}`, {
			episodes: playlistEpisodes,
		}).then(response => {
			this.props.updatePlaylist(response.data);
		});
	}
	render() {
		return (
			<div>
				<FollowSuggestionsPodcastPanel
					podcasts={this.props.suggestedPodcasts}
				/>
				<TodayPodcastPanel
					addEpisodeToPlaylist={this.addEpisodeToPlaylist}
					episodes={this.props.episodes}
					playlists={this.props.playlists}
				/>
				<PinsPodcastPanel
					addEpisodeToPlaylist={this.addEpisodeToPlaylist}
					pins={this.props.pinnedEpisodes}
					playlists={this.props.playlists}
					unpinEpisode={this.props.unpinEpisode}
				/>
				<EverythingPodcastPanel
					addEpisodeToPlaylist={this.addEpisodeToPlaylist}
					episodes={this.props.episodes}
					playlists={this.props.playlists}
				/>
			</div>
		);
	}
}

PodcastPanelsContainer.defaultProps = {
	episodes: [],
	pinnedEpisodes: [],
	suggestedPodcasts: [],
};

PodcastPanelsContainer.propTypes = {
	episodes: PropTypes.arrayOf(PropTypes.shape({})),
	getEpisodesFeed: PropTypes.func.isRequired,
	getPinnedEpisodes: PropTypes.func.isRequired,
	getPlaylists: PropTypes.func.isRequired,
	getPodcastFollowSuggestions: PropTypes.func.isRequired,
	pinnedEpisodes: PropTypes.arrayOf(PropTypes.shape({})),
	playlists: PropTypes.arrayOf(PropTypes.shape({})),
	suggestedPodcasts: PropTypes.arrayOf(PropTypes.shape({})),
	unpinEpisode: PropTypes.func.isRequired,
	updatePlaylist: PropTypes.func.isRequired,
};

const mapStateToProps = (state, ownProps) => {
	let suggestedPodcasts = [];
	let loading = false;
	if ('suggestedPodcasts' in state) {
		for (let podcastID of state.suggestedPodcasts) {
			suggestedPodcasts.push(state.podcasts[podcastID]);
		}
	} else {
		loading = true;
	}
	let pinnedEpisodes = [];
	for (var episodeID in state.pinnedEpisodes) {
		if (state.pinnedEpisodes.hasOwnProperty(episodeID)) {
			if (state.pinnedEpisodes[episodeID]) {
				let pin = { ...state.pinnedEpisodes[episodeID] };
				pin.episode = { ...state.episodes[episodeID] };
				pin.episode.podcast = { ...state.podcasts[pin.episode.podcast] };
				pinnedEpisodes.push(pin);
			}
		}
	}

	let episodes = [];
	if (state.feeds && state.feeds[`user_episode:${localStorage['authedUser']}`]) {
		for (let episodeID of state.feeds[`user_episode:${localStorage['authedUser']}`]) {
			// also get RSS feed
			let episode = {
				...state.episodes[episodeID.split(':')[1]],
			};
			episode.podcast = state.podcasts[episode.podcast];

			episodes.push(episode);
		}
	}

	// sort episodes
	episodes.sort((a, b) => {
		return (
			new Date(b.publicationDate).valueOf() - new Date(a.publicationDate).valueOf()
		);
	});

	return {
		...ownProps,
		episodes,
		loading,
		pinnedEpisodes,
		playlists: getPlaylistsForUser(state, localStorage['authedUser']),
		suggestedPodcasts,
	};
};

const mapDispatchToProps = (dispatch, ownProps) => {
	return {
		getEpisodesFeed: () => {
			fetch('GET', `/users/${localStorage['authedUser']}/feeds`, null, {
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
		},
		getPinnedEpisodes: () => {
			fetch('GET', '/pins', null, { type: 'episode' }).then(response => {
				for (let pin of response.data) {
					// dispatch update to podcast
					dispatch({
						podcast: pin.episode.podcast,
						type: 'UPDATE_PODCAST_SHOW',
					});
					// dispatch updates to episodes
					dispatch({
						episode: pin.episode,
						type: 'UPDATE_EPISODE',
					});
					// dispatch updates to pins
					dispatch({
						pin,
						type: 'PIN_EPISODE',
					});
				}
			});
		},
		// have to get playlists for all the stupid popovers-on-popovers....
		getPlaylists: () => {
			fetch('GET', '/playlists', null, { user: localStorage['authedUser'] }).then(
				response => {
					for (let playlist of response.data) {
						dispatch({
							playlist: { ...playlist },
							type: 'UPDATE_PLAYLIST',
						});
					}
				},
			);
		},
		getPodcastFollowSuggestions: () => {
			fetch('GET', '/podcasts', {}, { type: 'recommended' })
				.then(response => {
					// dispatch podcast updates
					for (let podcast of response.data) {
						dispatch({
							podcast,
							type: 'UPDATE_PODCAST_SHOW',
						});
					}
					// dispatch follow suggestion updates
					dispatch({
						podcasts: response.data,
						type: 'UPDATE_SUGGESTED_PODCASTS',
					});
				})
				.catch(err => {
					console.log(err); // eslint-disable-line no-console
				});
		},
		unpinEpisode: (pinID, episodeID) => {
			fetch('DELETE', `/pins/${pinID}`)
				.then(() => {
					dispatch({
						episodeID,
						type: 'UNPIN_EPISODE',
					});
				})
				.catch(err => {
					console.log(err); // eslint-disable-line no-console
				});
		},
		updatePlaylist: playlist => {
			dispatch({
				playlist,
				type: 'UPDATE_PLAYLIST',
			});
		},
		...ownProps,
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(PodcastPanelsContainer);
