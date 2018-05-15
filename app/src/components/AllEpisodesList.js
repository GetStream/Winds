import fetch from '../util/fetch';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import EpisodeListItem from './EpisodeListItem';
import Waypoint from 'react-waypoint';

class AllEpisodesList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			cursor: 0,
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
	}
	getEpisodes() {
		fetch('GET', `/users/${localStorage['authedUser']}/feeds`, null, {
			page: this.state.cursor,
			per_page: 10,
			type: 'episode',
		}).then(response => {
			let episodes = response.data.map(episode => {
				return { ...episode, type: 'episode' };
			});

			for (let episode of episodes) {
				if (episode._id) {
					// update podcast
					this.props.dispatch({
						podcast: episode.podcast,
						type: 'UPDATE_PODCAST_SHOW',
					});
					// update episode
					this.props.dispatch({
						episode,
						type: 'UPDATE_EPISODE',
					});
				} else {
					return;
				}
			}

			this.props.dispatch({
				activities: episodes,
				feedID: `user_episode:${localStorage['authedUser']}`,
				type: 'UPDATE_FEED',
			});
		});
	}
	render() {
		return (
			<React.Fragment>
				<div className="podcast-header content-header">
					<h1>All Episodes</h1>
				</div>
				<div className="list content">
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

			episodes.push(episode);
		}
	}

	return { ...ownProps, episodes };
};

export default connect(mapStateToProps)(AllEpisodesList);
