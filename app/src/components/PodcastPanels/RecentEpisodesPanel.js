import getPlaceholderImageURL from '../../util/getPlaceholderImageURL';
import { Img } from 'react-image';
import React from 'react';
import Panel from '../Panel';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { getFeed } from '../../util/feeds';
import TimeAgo from '../TimeAgo';
import PropTypes from 'prop-types';

class RecentEpisodesPanel extends React.Component {
	componentDidMount() {
		if (!this.props.episodes.length) getFeed(this.props.dispatch, 'episode', 0, 20);
	}
	render() {
		return (
			<Panel expandable={true} headerLink="/podcasts" headerText="Recent Episodes">
				{this.props.episodes.slice(0, 20).map((episode) => {
					return (
						<Link
							key={episode._id}
							to={`/podcasts/${episode.podcast._id}/episodes/${episode._id}`}
						>
							<Img
								loader={<div className="placeholder" />}
								src={[
									episode.podcast.images.favicon,
									getPlaceholderImageURL(episode._id),
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

const mapStateToProps = (state) => ({
	episodes:
		state.episodes && state.feeds && state.feeds.episode
			? state.feeds.episode.map((id) => state.episodes[id])
			: [],
});

export default connect(mapStateToProps)(RecentEpisodesPanel);
