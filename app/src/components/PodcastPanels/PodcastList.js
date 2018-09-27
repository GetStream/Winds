import getPlaceholderImageURL from '../../util/getPlaceholderImageURL';
import Img from 'react-image';
import React from 'react';
import Panel from '../Panel';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { getPodcastsFollows } from '../../api';

class PodcastList extends React.Component {
	componentDidMount() {
		getPodcastsFollows(this.props.dispatch);
	}

	render() {
		return (
			<Panel
				hasHighlight={
					this.props.match.params.podcastID &&
					this.props.match.params.podcastID !== 'recent'
				}
				headerText="Podcasts"
				headerLink="/podcasts"
			>
				{this.props.podcasts.map(podcast => {
					return (
						<Link
							className={
								this.props.match.params.podcastID === podcast._id
									? 'highlighted'
									: ''
							}
							key={podcast._id}
							to={`/podcasts/${podcast._id}`}
						>
							<Img
								src={[podcast.images.favicon, getPlaceholderImageURL()]}
								loader={<div className="placeholder" />}
							/>
							<div>{podcast.title}</div>
							<div>
								<i className="fa fa-chevron-right" />
							</div>
						</Link>
					);
				})}
			</Panel>
		);
	}
}

PodcastList.propTypes = {
	dispatch: PropTypes.func.isRequired,
	match: PropTypes.shape({
		params: PropTypes.shape({
			podcastID: PropTypes.string,
		}),
	}),
	podcasts: PropTypes.arrayOf(PropTypes.shape({})),
};

const mapStateToProps = (state, ownProps) => {
	let podcastsUserFollows = [];

	if (state.followedPodcasts && state.followedPodcasts[localStorage['authedUser']]) {
		for (let podcastID of Object.keys(
			state.followedPodcasts[localStorage['authedUser']],
		)) {
			if (state.followedPodcasts[localStorage['authedUser']][podcastID]) {
				podcastsUserFollows.push(podcastID);
			}
		}
	}

	let podcasts = podcastsUserFollows.map(podcastID => {
		return state.podcasts[podcastID];
	});

	if (state.aliases) {
		podcasts = podcasts.map(podcast => {
			if (state.aliases[podcast._id])
				podcast.title = state.aliases[podcast._id].alias;
			return podcast;
		});
	}

	podcasts.sort((a, b) => {
		return a.title.localeCompare(b.title);
	});
	return {
		...ownProps,
		podcasts,
	};
};

export default connect(mapStateToProps)(withRouter(PodcastList));
