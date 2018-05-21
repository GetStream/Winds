import loaderIcon from '../images/loaders/default.svg';
import Waypoint from 'react-waypoint';
import getPlaceholderImageURL from '../util/getPlaceholderImageURL';
import EpisodeListItem from './EpisodeListItem';
import Img from 'react-image';
import Popover from 'react-popover';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import fetch from '../util/fetch';
import moment from 'moment';
import { getPinnedEpisodes } from '../util/pins';
import { getFeed } from '../util/feeds';
import Loader from './Loader';

class PodcastEpisodesView extends React.Component {
	constructor(props) {
		super(props);
		this.toggleFollowPodcast = this.toggleFollowPodcast.bind(this);
		this.toggleMenu = this.toggleMenu.bind(this);
		this.state = {
			episodeCursor: 1, // mongoose-api-query starts pages at 1, not 0
			menuIsOpen: false,
			sortBy: 'latest',
		};
	}
	componentDidMount() {
		this.props.getPodcast(this.props.match.params.podcastID);
		this.getEpisodes(this.props.match.params.podcastID);
		getPinnedEpisodes(this.props.dispatch);
		getFeed(this.props.dispatch, 'episode', 0, 20); // this is to populate 'recent' state indicators
	}
	componentWillReceiveProps(nextProps) {
		if (nextProps.match.params.podcastID !== this.props.match.params.podcastID) {
			// essentially, if we've just switched views from one podcast to another
			this.props.getPodcast(nextProps.match.params.podcastID);
			this.getEpisodes(nextProps.match.params.podcastID);
			getPinnedEpisodes(this.props.dispatch);
			getFeed(this.props.dispatch, 'episode', 0, 20); // this is to populate 'recent' state indicators
			this.setState({
				episodeCursor: 1, // mongoose-api-query starts pages at 1, not 0
			});
		}
	}

	getEpisodes(forPodcastID) {
		fetch(
			'GET',
			'/episodes',
			{},
			{
				page: this.state.episodeCursor,
				per_page: 10,
				podcast: forPodcastID,
				sort_by: 'publicationDate,desc',
			},
		)
			.then(res => {
				if (res.data.length === 0) {
					this.setState({
						reachedEndOfFeed: true,
					});
				}
				this.props.dispatch({
					episodes: res.data,
					type: 'BATCH_UPDATE_EPISODES',
				});
			})
			.catch(err => {
				console.log(err); // eslint-disable-line no-console
			});
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
		sortedEpisodes.sort((a, b) => {
			return (
				moment(b.publicationDate).valueOf() - moment(a.publicationDate).valueOf()
			);
		});

		let menuContent = (
			<div className="podcast-episode-list-view-popover">
				<div className="panel">
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

		let rightColumn;

		if (sortedEpisodes.length === 0) {
			rightColumn = (
				<div>
					<p>{'We haven\'t found any episodes for this podcast feed yet :('}</p>
					<p>
						{
							'It might be because the podcast feed doesn\'t have any episodes, or because it just got added and we\'re still parsing them. Come check back in a few minutes.'
						}
					</p>
					<p>
						{
							'If you\'re pretty sure there\'s supposed to be some episodes here, and they aren\'t showing up, please file a '
						}
						<a href="https://github.com/getstream/winds/issues">
							GitHub Issue
						</a>.
					</p>
				</div>
			);
		} else {
			rightColumn = (
				<div>
					{sortedEpisodes.map((episode, i) => {
						let active = false;
						if (
							this.props.context.contextID ===
								this.props.match.params.podcastID &&
							i === this.props.context.contextPosition
						) {
							active = true;
						}
						return (
							<EpisodeListItem
								active={active}
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
								playable={true}
								playing={this.props.context.playing}
								position={i}
								unpinEpisode={() => {
									this.props.unpinEpisode(episode.pinID, episode._id);
								}}
								{...episode}
							/>
						);
					})}
					{this.state.reachedEndOfFeed ? (
						<div className="end">
							<p>{'That\'s it! No more episodes here.'}</p>
							<p>
								{
									'What, did you think that once you got all the way around, you\'d just be back at the same place that you started? Sounds like some real round-feed thinking to me.'
								}
							</p>
						</div>
					) : (
						<div>
							<Waypoint
								onEnter={() => {
									this.setState(
										{
											episodeCursor: this.state.episodeCursor + 1,
										},
										() => {
											this.getEpisodes(
												this.props.match.params.podcastID,
											);
										},
									);
								}}
							/>
							<div className="end-loader">
								<Img src={loaderIcon} />
							</div>
						</div>
					)}
				</div>
			);
		}

		return (
			<React.Fragment>
				<div className="content-header list-view-header">
					<div className="alignment-box">
						<div className="image">
							<Img
								src={[
									this.props.podcast.images.featured,
									this.props.podcast.images.og,
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
								tipSize={0.1}
							>
								<div onClick={this.toggleMenu}>
									<i className="fa fa-ellipsis-h fa-2x" />
								</div>
							</Popover>
						</div>
					</div>
				</div>

				<div className="list podcast-episode-list content">{rightColumn}</div>
			</React.Fragment>
		);
	}
}

PodcastEpisodesView.defaultProps = {
	episodes: [],
	isFollowing: false,
};

PodcastEpisodesView.propTypes = {
	context: PropTypes.shape({
		contextID: PropTypes.string,
		contextPosition: PropTypes.number,
		playing: PropTypes.bool,
	}),
	dispatch: PropTypes.func.isRequired,
	episodes: PropTypes.array,
	followPodcast: PropTypes.func.isRequired,
	getPodcast: PropTypes.func.isRequired,
	isFollowing: PropTypes.bool,
	match: PropTypes.shape({
		params: PropTypes.shape({
			podcastID: PropTypes.string,
		}),
	}),
	pauseEpisode: PropTypes.func.isRequired,
	pinEpisode: PropTypes.func.isRequired,
	playEpisode: PropTypes.func.isRequired,
	podcast: PropTypes.shape({
		_id: PropTypes.string,
		images: PropTypes.shape({
			favicon: PropTypes.string,
			featured: PropTypes.string,
			og: PropTypes.string,
		}),
		title: PropTypes.string,
	}),
	resumeEpisode: PropTypes.func.isRequired,
	unfollowPodcast: PropTypes.func.isRequired,
	unpinEpisode: PropTypes.func.isRequired,
};

const mapStateToProps = (state, ownProps) => {
	let isFollowing = false;
	let podcastID = ownProps.match.params.podcastID;

	if (
		state.followedPodcasts &&
		state.followedPodcasts[localStorage['authedUser']] &&
		state.followedPodcasts[localStorage['authedUser']][podcastID]
	) {
		isFollowing = true;
	}
	let podcast = null;
	if (state.podcasts && state.podcasts[podcastID]) {
		podcast = { ...state.podcasts[podcastID] };
	}
	let episodes = [];
	if (state.episodes) {
		for (let episode of Object.keys(state.episodes)) {
			if (state.episodes[episode].podcast === podcastID) {
				episodes.push({ ...state.episodes[episode] });
			}
		}
	}
	for (let episode of episodes) {
		// attach pinned state
		if (state.pinnedEpisodes && state.pinnedEpisodes[episode._id]) {
			episode.pinned = true;
			episode.pinID = state.pinnedEpisodes[episode._id]._id;
		} else {
			episode.pinned = false;
		}

		if (state.feeds && state.feeds[`user_episode:${localStorage['authedUser']}`]) {
			if (
				state.feeds[`user_episode:${localStorage['authedUser']}`].indexOf(
					episode._id,
				) < 20 &&
				state.feeds[`user_episode:${localStorage['authedUser']}`].indexOf(
					episode._id,
				) !== -1
			) {
				episode.recent = true;
			} else {
				episode.recent = false;
			}
		}

		// attach podcast
		episode.podcast = { ...podcast };
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
	let podcastID = ownProps.match.params.podcastID;
	return {
		dispatch,
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

export default connect(mapStateToProps, mapDispatchToProps)(PodcastEpisodesView);
