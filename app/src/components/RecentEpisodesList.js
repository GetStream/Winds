import fetch from '../util/fetch';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import EpisodeListItem from './EpisodeListItem';
import { getPinnedEpisodes } from '../util/pins';
import { getEpisodesFeed } from '../util/feeds';

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
		getPinnedEpisodes(this.props.dispatch);
		getEpisodesFeed(this.props.dispatch, 0, 20);
	}

	render() {
		return (
			<React.Fragment>
				<div className="list-view-header content-header">
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
		episodes: episodes.slice(0, 20),
	};
};

export default connect(mapStateToProps)(RecentEpisodesList);
