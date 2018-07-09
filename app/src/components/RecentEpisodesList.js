// import fetch from '../util/fetch';
// import PropTypes from 'prop-types';
// import React from 'react';
// import { connect } from 'react-redux';
// import EpisodeListItem from './EpisodeListItem';
// import { getPinnedEpisodes } from '../util/pins';
// import { getFeed } from '../util/feeds';
//
// class RecentEpisodesList extends React.Component {
// 	constructor(props) {
// 		super(props);
// 		this.state = {
// 			newEpisodesAvailable: false,
// 		};
// 	}
// 	pinEpisode(episodeID) {
// 		fetch('POST', '/pins', {
// 			episode: episodeID,
// 		})
// 			.then(response => {
// 				this.props.dispatch({
// 					pin: response.data,
// 					type: 'PIN_EPISODE',
// 				});
// 			})
// 			.catch(err => {
// 				console.log(err); // eslint-disable-line no-console
// 			});
// 	}
// 	unpinEpisode(pinID, episodeID) {
// 		fetch('DELETE', `/pins/${pinID}`)
// 			.then(() => {
// 				this.props.dispatch({
// 					episodeID,
// 					type: 'UNPIN_EPISODE',
// 				});
// 			})
// 			.catch(err => {
// 				console.log(err); // eslint-disable-line no-console
// 			});
// 	}
// 	componentDidMount() {
// 		getPinnedEpisodes(this.props.dispatch);
// 		getFeed(this.props.dispatch, 'episode', 0, 20);
// 		this.subscription = window.streamClient
// 			.feed('user_episode', this.props.userID, this.props.userEpisodeStreamToken)
// 			.subscribe(() => {
// 				this.setState({
// 					newEpisodesAvailable: true,
// 				});
// 			});
// 	}
//
// 	componentWillUnmount() {
// 		this.subscription.cancel();
// 	}
//
// 	render() {
// 		return (
// 			<React.Fragment>
// 				<div className="list-view-header content-header">
// 					<h1>Recent Episodes</h1>
// 				</div>
// 				<div className="list content">
// 					{this.state.newEpisodesAvailable ? (
// 						<div
// 							className="toast"
// 							onClick={() => {
// 								getFeed(this.props.dispatch, 'episode', 0, 20);
// 								this.setState({
// 									newEpisodesAvailable: false,
// 								});
// 							}}
// 						>
// 							New episodes available - click to refresh
// 						</div>
// 					) : null}
// 					{this.props.episodes.map(episode => {
// 						return (
// 							<EpisodeListItem
// 								key={episode._id}
// 								pinEpisode={() => {
// 									this.pinEpisode(episode._id);
// 								}}
// 								playable={false}
// 								unpinEpisode={() => {
// 									this.unpinEpisode(episode.pinID, episode._id);
// 								}}
// 								{...episode}
// 							/>
// 						);
// 					})}
// 				</div>
// 			</React.Fragment>
// 		);
// 	}
// }
//
// RecentEpisodesList.defaultProps = {
// 	episodes: [],
// };
//
// RecentEpisodesList.propTypes = {
// 	dispatch: PropTypes.func.isRequired,
// 	episodes: PropTypes.arrayOf(PropTypes.shape({})),
// 	userID: PropTypes.string.isRequired,
// 	userEpisodeStreamToken: PropTypes.string.isRequired,
// };
//
// const mapStateToProps = (state, ownProps) => {
// 	let episodes = [];
// 	if (state.feeds && state.feeds[`user_episode:${localStorage['authedUser']}`]) {
// 		for (let episodeID of state.feeds[`user_episode:${localStorage['authedUser']}`]) {
// 			// also get RSS feed
// 			let episode = {
// 				...state.episodes[episodeID],
// 			};
// 			episode.podcast = { ...state.podcasts[episode.podcast] };
//
// 			if (state.pinnedEpisodes && state.pinnedEpisodes[episode._id]) {
// 				episode.pinned = true;
// 				episode.pinID = state.pinnedEpisodes[episode._id]._id;
// 			} else {
// 				episode.pinned = false;
// 			}
//
// 			if (
// 				state.feeds[`user_episode:${localStorage['authedUser']}`].indexOf(
// 					episodeID,
// 				) < 20 &&
// 				state.feeds[`user_episode:${localStorage['authedUser']}`].indexOf(
// 					episodeID,
// 				) !== -1
// 			) {
// 				episode.recent = true;
// 			} else {
// 				episode.recent = false;
// 			}
//
// 			episodes.push(episode);
// 		}
// 	}
//
// 	return {
// 		...ownProps,
// 		episodes: episodes.slice(0, 20),
// 		userEpisodeStreamToken:
// 			state.users[localStorage['authedUser']].streamTokens.user_episode,
// 		userID: localStorage['authedUser'],
// 	};
// };
//
// export default connect(mapStateToProps)(RecentEpisodesList);
