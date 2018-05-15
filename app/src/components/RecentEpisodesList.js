import fetch from '../util/fetch';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import EpisodeListItem from './EpisodeListItem';

class RecentEpisodesList extends React.Component {
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
		fetch('GET', `/users/${localStorage['authedUser']}/feeds`, null, {
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
				<div className="podcast-header">
					<h1>Recent Episodes</h1>
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
				</div>
			</React.Fragment>
		);
	}
}

RecentEpisodesList.defaultProps = {
	episodes: [],
};

RecentEpisodesList.propTypes = {
	dispatch: PropTypes.func.isRequired,
	episodes: PropTypes.arrayOf(PropTypes.shape({})),
};

const mapStateToProps = (state, ownProps) => {
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

	return {
		...ownProps,
		episodes: episodes.slice(0, 20),
	};
};

export default connect(mapStateToProps)(RecentEpisodesList);
