import playIcon from '../images/icons/play-alt.svg';
import Img from 'react-image';
import { Link } from 'react-router-dom';
import Loader from './Loader';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import fetch from '../util/fetch';
import getPlaceholderImageURL from '../util/getPlaceholderImageURL';
import { withRouter } from 'react-router-dom';

class FeaturedPlaylistCard extends React.Component {
	componentDidMount() {
		this.props.getFeaturedPlaylist();
	}
	render() {
		if (this.props.loading) {
			return <Loader />;
		} else if (this.props.playlist === null) {
			return null;
		} else {
			return (
				<Link
					className="content-featured"
					to={`/playlists/${this.props.playlist._id}`}
				>
					<div className="left">
						<div
							className="poster"
							onClick={e => {
								e.preventDefault();
								e.stopPropagation();
								this.props.playPlaylist();
								this.props.history.push(
									`/playlists/${this.props.playlist._id}`,
								);
							}}
						>
							<Img
								height="100"
								src={getPlaceholderImageURL(this.props.playlist._id)}
								width="100"
							/>
							<div className="control">
								<Img src={playIcon} />
							</div>
						</div>
					</div>
					<div className="right">
						<div className="title">{this.props.playlist.name}</div>
						<div className="description">
							{this.props.playlist.description}
						</div>
					</div>
				</Link>
			);
		}
	}
}

FeaturedPlaylistCard.defaultProps = {
	loading: true,
};

FeaturedPlaylistCard.propTypes = {
	_id: PropTypes.string,
	description: PropTypes.string,
	getFeaturedPlaylist: PropTypes.func.isRequired,
	history: PropTypes.shape({ push: PropTypes.func.isRequired }).isRequired,
	loading: PropTypes.bool,
	name: PropTypes.string,
	playPlaylist: PropTypes.func.isRequired,
	playlist: PropTypes.shape({
		_id: PropTypes.string,
		description: PropTypes.string,
		name: PropTypes.string,
	}),
};

const mapStateToProps = state => {
	let loading = false;
	if (!('featuredPlaylist' in state)) {
		return {
			loading: true,
		};
	} else if (state.featuredPlaylist === null) {
		return {
			loading: false,
			playlist: null,
		};
	}
	let user = state.users[state.playlists[state.featuredPlaylist].user];
	// select playlist episodes
	let episodes = [];
	for (let episodeID of state.playlists[state.featuredPlaylist].episodes) {
		episodes.push({ ...state.episodes[episodeID] });
	}
	// select shows for each episode
	for (let episode of episodes) {
		episode.show = { ...state.podcasts[episode.podcast] };
	}
	return {
		loading,
		playlist: { ...state.playlists[state.featuredPlaylist], episodes, user },
	};
};

const mapDispatchToProps = dispatch => {
	return {
		getFeaturedPlaylist: () => {
			fetch('GET', '/playlists', {}, { type: 'featured' })
				.then(res => {
					if (res.status === 204) {
						// set featured playlist to null
						dispatch({
							playlistID: null,
							type: 'SET_FEATURED_PLAYLIST',
						});
						return;
					}

					let playlist = res.data;

					// update shows
					for (let episode of playlist.episodes) {
						dispatch({
							podcast: episode.podcast,
							type: 'UPDATE_PODCAST_SHOW',
						});
					}

					// update episodes
					for (let episode of playlist.episodes) {
						dispatch({
							episode,
							type: 'UPDATE_EPISODE',
						});
					}
					// update user
					dispatch({
						type: 'UPDATE_USER',
						user: playlist.user,
					});
					// update playlist
					dispatch({
						playlist: playlist,
						type: 'UPDATE_PLAYLIST',
					});
					// set featured playlist
					dispatch({
						playlistID: playlist._id,
						type: 'SET_FEATURED_PLAYLIST',
					});
				})
				.catch(err => {
					console.log(err); // eslint-disable-line no-console
				});
		},
		playEpisode: (episodeID, playlistID) => {
			dispatch({
				contextID: playlistID,
				contextPosition: 0,
				contextType: 'playlist',
				episodeID: episodeID,
				type: 'PLAY_EPISODE',
			});
		},
	};
};

const mergeProps = (stateProps, dispatchProps) => {
	return {
		playPlaylist: () => {
			if (stateProps.playlist.episodes.length === 0) {
				return;
			} else {
				let episodeID = stateProps.playlist.episodes[0]._id;
				let playlistID = stateProps.playlist._id;
				dispatchProps.playEpisode(episodeID, playlistID);
			}
		},
		...stateProps,
		...dispatchProps,
	};
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(
	withRouter(FeaturedPlaylistCard),
);
