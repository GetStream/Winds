import optionsIcon from '../images/icons/options.svg';
import getPlaceholderImageURL from '../util/getPlaceholderImageURL';
import EpisodeListItem from './EpisodeListItem';
import Img from 'react-image';
import Popover from 'react-popover';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import fetch from '../util/fetch';
import moment from 'moment';
import Loader from './Loader';

class EpisodesView extends React.Component {
	constructor(props) {
		super(props);
		this.toggleFollowPodcast = this.toggleFollowPodcast.bind(this);
		this.toggleMenu = this.toggleMenu.bind(this);
		this.state = {
			menuIsOpen: false,
			sortBy: 'latest',
		};
	}
	componentDidMount() {
		this.props.getPodcast(this.props.podcastID);
		this.props.getEpisodes(this.props.podcastID);
		this.props.getPodcastFollowers(this.props.podcastID);
		this.props.getPlaylistsForUser();
	}
	componentWillReceiveProps(nextProps) {
		if (nextProps.podcastID !== this.props.podcastID) {
			this.props.getPodcast(nextProps.podcastID);
			this.props.getEpisodes(nextProps.podcastID);
			this.props.getPodcastFollowers(nextProps.podcastID);
			this.props.getPlaylistsForUser();
		}
	}
	toggleFollowPodcast() {
		if (this.props.isFollowing) {
			this.props.unfollowPodcast();
		} else {
			this.props.followPodcast();
		}
	}

	toggleMenu() {
		this.setState({
			menuIsOpen: !this.state.menuIsOpen,
		});
	}

	render() {
		if (!this.props.podcast) {
			return <Loader />;
		}

		let sortedEpisodes = [...this.props.episodes];
		if (this.state.sortBy === 'latest') {
			sortedEpisodes.sort((a, b) => {
				return (
					moment(b.publicationDate).valueOf() -
					moment(a.publicationDate).valueOf()
				);
			});
		} else {
			sortedEpisodes.sort((a, b) => {
				return (
					moment(a.publicationDate).valueOf() -
					moment(b.publicationDate).valueOf()
				);
			});
		}

		let menuContent = (
			<div className="podcast-episode-list-view-popover">
				<div className="panel">
					<div className="panel-element">
						<label>
							<input
								checked={this.state.sortBy === 'latest'}
								onChange={() => {
									this.setState({
										sortBy: 'latest',
									});
								}}
								type="radio"
							/>
							<span>Latest</span>
						</label>
					</div>
					<div className="panel-element">
						<label>
							<input
								checked={this.state.sortBy === 'oldest'}
								onChange={() => {
									this.setState({
										sortBy: 'oldest',
									});
								}}
								type="radio"
							/>
							<span>Oldest</span>
						</label>
					</div>
					<div
						className="panel-element"
						onClick={() => {
							if (this.props.isFollowing) {
								this.props.unfollowPodcast();
							} else {
								this.props.followPodcast();
							}
						}}
					>
						{this.props.isFollowing ? 'Unfollow' : 'Follow'}
					</div>
				</div>
			</div>
		);

		return (
			<div>
				<div className="podcast-header">
					<div className="image">
						<Img
							src={[
								this.props.podcast.images.favicon,
								getPlaceholderImageURL(this.props.podcast._id),
							]}
						/>
					</div>
					<div className="info">
						<h1>{this.props.podcast.title}</h1>
					</div>
					<div className="menu">
						<Popover
							body={menuContent}
							isOpen={this.state.menuIsOpen}
							onOuterAction={this.toggleMenu}
							place="below"
						>
							<div onClick={this.toggleMenu}>
								<Img src={optionsIcon} />
							</div>
						</Popover>
					</div>
				</div>

				<div className="list podcast-episode-list">
					{sortedEpisodes.map((episode, i) => {
						let active = false;
						if (
							this.props.context.contextID === this.props.podcastID &&
							i === this.props.context.contextPosition
						) {
							active = true;
						}

						return (
							<EpisodeListItem
								active={active}
								image={[
									this.props.podcast.images.favicon,
									getPlaceholderImageURL(this.props.podcast._id),
								]}
								key={episode._id}
								pinEpisode={() => {
									this.props.pinEpisode(episode._id);
								}}
								playOrPauseEpisode={() => {
									if (active && this.props.context.playing) {
										this.props.pauseEpisode();
									} else if (active) {
										this.props.resumeEpisode();
									} else {
										this.props.playEpisode(episode._id, i);
									}
								}}
								playing={this.props.context.playing}
								position={i}
								toggleLike={() => {
									if (episode.liked) {
										this.props.unlike(episode._id);
									} else {
										this.props.like(episode._id);
									}
								}}
								unpinEpisode={() => {
									this.props.unpinEpisode(episode.pinID, episode._id);
								}}
								{...episode}
							/>
						);
					})}
				</div>
			</div>
		);
	}
}

EpisodesView.defaultProps = {
	episodes: [],
	isFollowing: false,
};

EpisodesView.propTypes = {
	context: PropTypes.shape({
		contextID: PropTypes.string,
		contextPosition: PropTypes.number,
		playing: PropTypes.bool,
	}),
	episodes: PropTypes.array,
	followPodcast: PropTypes.func.isRequired,
	getEpisodes: PropTypes.func.isRequired,
	getPlaylistsForUser: PropTypes.func.isRequired,
	getPodcast: PropTypes.func.isRequired,
	getPodcastFollowers: PropTypes.func.isRequired,
	isFollowing: PropTypes.bool,
	like: PropTypes.func.isRequired,
	pauseEpisode: PropTypes.func.isRequired,
	pinEpisode: PropTypes.func.isRequired,
	playEpisode: PropTypes.func.isRequired,
	podcast: PropTypes.shape({
		_id: PropTypes.string,
		images: PropTypes.shape({
			favicon: PropTypes.string,
		}),
		title: PropTypes.string,
	}),
	podcastID: PropTypes.string.isRequired,
	resumeEpisode: PropTypes.func.isRequired,
	unfollowPodcast: PropTypes.func.isRequired,
	unlike: PropTypes.func.isRequired,
	unpinEpisode: PropTypes.func.isRequired,
};

const mapStateToProps = (state, ownProps) => {
	let isFollowing = false;

	if (
		state.followedPodcasts &&
		state.followedPodcasts[localStorage['authedUser']] &&
		state.followedPodcasts[localStorage['authedUser']][ownProps.podcastID]
	) {
		isFollowing = true;
	}
	let podcast = null;
	if (state.podcasts && state.podcasts[ownProps.podcastID]) {
		podcast = state.podcasts[ownProps.podcastID];
	}
	let episodes = [];
	if (state.episodes) {
		episodes = Object.values(state.episodes).filter(episode => {
			// only return the episodes where the podcast ID matches the parent ID
			return episode.podcast === ownProps.podcastID;
		});
	}
	for (let episode of episodes) {
		// attach pinned state
		if (state.pinnedEpisodes && state.pinnedEpisodes[episode._id]) {
			episode.pinned = true;
			episode.pinID = state.pinnedEpisodes[episode._id]._id;
		} else {
			episode.pinned = false;
		}
	}
	let context = { ...state.player };
	return {
		context,
		episodes,
		isFollowing,
		podcast,
	};
};

const mapDispatchToProps = (dispatch, ownProps) => {
	let podcastID = ownProps.podcastID;
	return {
		followPodcast: () => {
			// optimistic dispatch
			// dispatch updated follow relationship
			dispatch({
				podcastID,
				type: 'FOLLOW_PODCAST',
				userID: localStorage['authedUser'],
			});
			// already have podcastID
			fetch(
				'POST',
				'/follows',
				{},
				{
					podcast: podcastID,
					type: 'podcast',
				},
			).catch(err => {
				console.log(err); // eslint-disable-line no-console
				dispatch({
					podcastID,
					type: 'UNFOLLOW_PODCAST',
					userID: localStorage['authedUser'],
				});
			});
		},
		getEpisodes: forPodcastID => {
			fetch(
				'GET',
				'/episodes',
				{},
				{
					per_page: '10',
					podcast: forPodcastID,
				},
			)
				.then(res => {
					for (let episode of res.data) {
						dispatch({
							episode,
							type: 'UPDATE_EPISODE',
						});
					}
				})
				.catch(err => {
					console.log(err); // eslint-disable-line no-console
				});
		},
		getPlaylistsForUser: () => {
			fetch('GET', '/playlists', null, { user: localStorage['authedUser'] })
				.then(response => {
					for (let playlist of response.data) {
						dispatch({
							playlist,
							type: 'UPDATE_PLAYLIST',
						});
					}
				})
				.catch(err => {
					console.log(err); // eslint-disable-line no-console
				});
		},

		getPodcast: podcastID => {
			fetch('GET', `/podcasts/${podcastID}`)
				.then(res => {
					dispatch({
						podcast: res.data,
						type: 'UPDATE_PODCAST_SHOW',
					});
				})
				.catch(err => {
					console.log(err); // eslint-disable-line no-console
				});
		},
		getPodcastFollowers: podcastID => {
			fetch('GET', '/follows', null, { podcast: podcastID }).then(response => {
				for (let followRelationship of response.data) {
					dispatch({
						type: 'UPDATE_USER',
						user: followRelationship.user,
					});
					dispatch({
						followRelationship,
						type: 'UPDATE_PODCAST_FOLLOWER',
					});
				}
			});
		},
		like: episodeID => {
			// optimistic dispatch
			dispatch({
				objectID: episodeID,
				objectType: 'episode',
				type: 'LIKE',
			});

			fetch('POST', '/likes', {
				episode: episodeID,
			}).catch(err => {
				// rollback on failure
				dispatch({
					objectID: episodeID,
					objectType: 'episode',
					type: 'UNLIKE',
				});

				console.log(err); // eslint-disable-line no-console
			});
		},
		pauseEpisode: () => {
			dispatch({ type: 'PAUSE_EPISODE' });
		},
		pinEpisode: episodeID => {
			fetch('POST', '/pins', {
				episode: episodeID,
			})
				.then(response => {
					dispatch({
						pin: response.data,
						type: 'PIN_EPISODE',
					});
				})
				.catch(err => {
					console.log(err); // eslint-disable-line no-console
				});
		},
		playEpisode: (episodeID, position) => {
			dispatch({
				contextID: podcastID,
				contextPosition: position,
				contextType: 'podcast',
				episodeID: episodeID,
				playing: true,
				type: 'PLAY_EPISODE',
			});
		},
		resumeEpisode: () => {
			dispatch({ type: 'RESUME_EPISODE' });
		},
		unfollowPodcast: () => {
			// optimistic dispatch
			// dispatch updated follow relationship
			dispatch({
				podcastID,
				type: 'UNFOLLOW_PODCAST',
				userID: localStorage['authedUser'],
			});

			fetch('DELETE', '/follows', null, {
				podcast: podcastID,
				type: 'podcast',
			}).catch(err => {
				console.log(err); // eslint-disable-line no-console
				dispatch({
					podcastID,
					type: 'FOLLOW_PODCAST',
					userID: localStorage['authedUser'],
				});
			});
		},
		unlike: episodeID => {
			// optimistic dispatch
			dispatch({
				objectID: episodeID,
				objectType: 'episode',
				type: 'UNLIKE',
			});
			fetch('DELETE', '/likes', null, {
				episode: episodeID,
			}).catch(err => {
				// rollback if it fails
				dispatch({
					objectID: episodeID,
					objectType: 'episode',
					type: 'LIKE',
				});

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
	};
};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
	return {
		...dispatchProps,
		getEpisodes: forPodcastID => {
			dispatchProps.getEpisodes(forPodcastID);
		},
		getPodcast: podcastID => {
			dispatchProps.getPodcast(podcastID);
		},
		...stateProps,
		...ownProps,
	};
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(EpisodesView);
