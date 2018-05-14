import getPlaceholderImageURL from '../../util/getPlaceholderImageURL';
import Img from 'react-image';
import React from 'react';
import Panel from '../Panel';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import fetch from '../../util/fetch';
import { getEpisode } from '../../selectors';
import TimeAgo from '../TimeAgo';
import PropTypes from 'prop-types';

class RecentEpisodesPanel extends React.Component {
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
			<Panel>
				<Panel.Header to="/podcasts/recent">Recent Episodes</Panel.Header>
				<Panel.Contents>
					{this.props.episodes.slice(0, 20).map(episode => {
						return (
							<Link
								key={episode._id}
								to={`/podcasts/${episode.podcast._id}`}
							>
								<Img
									src={[
										episode.podcast.images.favicon,
										getPlaceholderImageURL(episode.podcast._id),
									]}
								/>
								<div>{episode.title}</div>
								<TimeAgo
									className="muted"
									timestamp={episode.publicationDate}
									trim={true}
								/>
							</Link>
						);
					})}
				</Panel.Contents>
			</Panel>
		);
	}
}

RecentEpisodesPanel.defaultProps = {
	episodes: [],
};

RecentEpisodesPanel.propTypes = {
	dispatch: PropTypes.func.isRequired,
	episodes: PropTypes.arrayOf(PropTypes.shape({})),
};

const mapStateToProps = (state, ownProps) => {
	let episodes = [];
	let userEpisodeFeed = [];
	if (state.feeds && state.feeds[`user_episode:${localStorage['authedUser']}`]) {
		userEpisodeFeed = state.feeds[`user_episode:${localStorage['authedUser']}`];
	}
	for (let episodeID of userEpisodeFeed) {
		// need to trim the `episode:` from the episode ID
		episodes.push(getEpisode(state, episodeID.replace('episode:', '')));
	}
	return { ...ownProps, episodes };
};

export default connect(mapStateToProps)(RecentEpisodesPanel);
