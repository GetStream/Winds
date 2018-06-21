import loaderIcon from '../images/loaders/default.svg';
import Img from 'react-image';
import fetch from '../util/fetch';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import EpisodeListItem from './EpisodeListItem';
import Waypoint from 'react-waypoint';
import { getFeed } from '../util/feeds';

class AllEpisodesList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			newEpisodesAvailable: false,
			cursor: 0,
			reachedEndOfFeed: false,
		};
	}
	pinEpisode(episodeID) {
		fetch('POST', '/pins', {
			episode: episodeID,
		})
			.then(response => {
				this.props.dispatch({
					pin: response.data,
					type: 'PIN_EPISODE',
				});
			})
			.catch(err => {
				console.log(err); // eslint-disable-line no-console
			});
	}
	unpinEpisode(pinID, episodeID) {
		fetch('DELETE', `/pins/${pinID}`)
			.then(() => {
				this.props.dispatch({
					episodeID,
					type: 'UNPIN_EPISODE',
				});
			})
			.catch(err => {
				console.log(err); // eslint-disable-line no-console
			});
	}

	componentDidMount() {
		this.getEpisodes();
		this.subscription = window.streamClient
			.feed('user_episode', this.props.userID, this.props.userEpisodeStreamToken)
			.subscribe(() => {
				this.setState({
					newEpisodesAvailable: true,
				});
			});
	}
	getEpisodes() {
		getFeed(this.props.dispatch, 'episode', this.state.cursor, 10);
	}

	componentWillUnmount() {
		this.subscription.cancel();
	}

	render() {
		return (
			<React.Fragment>
				<div className="list-view-header content-header">
					<h1>All Episodes</h1>
				</div>
				<div className="list content">
					{this.state.newEpisodesAvailable ? (
						<div
							className="toast"
							onClick={() => {
								this.getEpisodes();
								this.setState({
									newEpisodesAvailable: false,
								});
							}}
						>
							New episodes available - click to refresh
						</div>
					) : null}

					{this.props.episodes.map(episode => {
						return (
							<EpisodeListItem
								key={episode._id}
								pinEpisode={() => {
									this.pinEpisode(episode._id);
								}}
								playable={false}
								unpinEpisode={() => {
									this.unpinEpisode(episode.pinID, episode._id);
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
											cursor: this.state.cursor + 1,
										},
										() => {
											this.getEpisodes();
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
			</React.Fragment>
		);
	}
}

AllEpisodesList.defaultProps = {
	episodes: [],
};

AllEpisodesList.propTypes = {
	dispatch: PropTypes.func.isRequired,
	episodes: PropTypes.arrayOf(PropTypes.shape({})),
	userID: PropTypes.string.isRequired,
	userEpisodeStreamToken: PropTypes.string.isRequired,
};

const mapStateToProps = (state, ownProps) => {
	let episodes = [];
	if (state.feeds && state.feeds[`user_episode:${localStorage['authedUser']}`]) {
		for (let episodeID of state.feeds[`user_episode:${localStorage['authedUser']}`]) {
			// also get RSS feed
			let episode = {
				...state.episodes[episodeID],
			};
			episode.podcast = { ...state.podcasts[episode.podcast] };

			if (state.pinnedEpisodes && state.pinnedEpisodes[episode._id]) {
				episode.pinned = true;
				episode.pinID = state.pinnedEpisodes[episode._id]._id;
			} else {
				episode.pinned = false;
			}

			if (
				state.feeds[`user_episode:${localStorage['authedUser']}`].indexOf(
					episodeID,
				) < 20 &&
				state.feeds[`user_episode:${localStorage['authedUser']}`].indexOf(
					episodeID,
				) !== -1
			) {
				episode.recent = true;
			} else {
				episode.recent = false;
			}

			episodes.push(episode);
		}
	}

	return {
		...ownProps,
		episodes,
		userEpisodeStreamToken:
			state.users[localStorage['authedUser']].streamTokens.user_episode,
		userID: localStorage['authedUser'],
	};
};

export default connect(mapStateToProps)(AllEpisodesList);
