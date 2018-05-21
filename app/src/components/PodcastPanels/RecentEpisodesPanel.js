import getPlaceholderImageURL from '../../util/getPlaceholderImageURL';
import Img from 'react-image';
import React from 'react';
import Panel from '../Panel';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { getEpisode } from '../../selectors';
import { getFeed } from '../../util/feeds';
import TimeAgo from '../TimeAgo';
import PropTypes from 'prop-types';

class RecentEpisodesPanel extends React.Component {
	componentDidMount() {
		getFeed(this.props.dispatch, 'episode', 0, 20);
	}
	render() {
		return (
			<Panel
				expandable={true}
				headerLink="/podcasts/recent"
				headerText="Recent Episodes"
			>
				{this.props.episodes.slice(0, 20).map(episode => {
					return (
						<Link key={episode._id} to={`/podcasts/${episode.podcast._id}`}>
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
