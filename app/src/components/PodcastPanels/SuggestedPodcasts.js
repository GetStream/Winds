import { Link } from 'react-router-dom';
import getPlaceholderImageURL from '../../util/getPlaceholderImageURL';
import Img from 'react-image';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import fetch from '../../util/fetch';
import Panel from '../Panel';
import { getPodcasts, getPodcastsFollows } from '../../api';

class SuggestedPodcasts extends React.Component {
	componentDidMount() {
		if (this.props.podcasts.length) return;

		getPodcasts(this.props.dispatch);
		getPodcastsFollows(this.props.dispatch);
	}

	followPodcast(podcastID) {
		this.props.dispatch({
			podcastID,
			type: 'FOLLOW_PODCAST',
			userID: localStorage['authedUser'],
		});

		fetch('post', '/follows', null, {
			podcast: podcastID,
			type: 'podcast',
		}).catch(() => {
			this.props.dispatch({
				podcastID,
				type: 'UNFOLLOW_PODCAST',
				userID: localStorage['authedUser'],
			});
		});
	}

	unfollowPodcast(podcastID) {
		this.props.dispatch({
			podcastID,
			type: 'UNFOLLOW_PODCAST',
			userID: localStorage['authedUser'],
		});

		fetch('delete', '/follows', null, {
			podcast: podcastID,
			type: 'podcast',
		}).catch(() => {
			this.props.dispatch({
				podcastID,
				type: 'FOLLOW_PODCAST',
				userID: localStorage['authedUser'],
			});
		});
	}

	render() {
		return (
			<Panel headerText="Suggested Podcasts">
				{this.props.podcasts.map(podcast => {
					return (
						<Link key={podcast._id} to={`/podcasts/${podcast._id}`}>
							<Img
								src={[podcast.images.favicon, getPlaceholderImageURL()]}
								loader={<div className="placeholder" />}
							/>
							<div>{podcast.title}</div>
							<div
								className={`clickable ${
									this.props.followedPodcasts[podcast._id]
										? 'active'
										: ''
								}`}
								onClick={e => {
									e.preventDefault();
									if (this.props.followedPodcasts[podcast._id]) {
										this.unfollowPodcast(podcast._id);
									} else {
										this.followPodcast(podcast._id);
									}
								}}
							>
								Follow
							</div>
						</Link>
					);
				})}
			</Panel>
		);
	}
}

SuggestedPodcasts.defaultProps = {
	followedPodcasts: {},
	podcasts: [],
};

SuggestedPodcasts.propTypes = {
	dispatch: PropTypes.func.isRequired,
	followedPodcasts: PropTypes.shape(),
	podcasts: PropTypes.arrayOf(PropTypes.shape()),
};

const mapStateToProps = (state, ownProps) => {
	let podcasts = [];
	let followedPodcasts = {};

	if (state.followedPodcasts && state.followedPodcasts[localStorage['authedUser']]) {
		followedPodcasts = { ...state.followedPodcasts[localStorage['authedUser']] };
	}

	if ('suggestedPodcasts' in state) {
		for (let podcastID of state.suggestedPodcasts) {
			podcasts.push(state.podcasts[podcastID]);
		}
	}

	return { ...ownProps, followedPodcasts, podcasts };
};

export default connect(mapStateToProps)(SuggestedPodcasts);
