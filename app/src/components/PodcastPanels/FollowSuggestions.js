import Img from 'react-image';
import PropTypes from 'prop-types';
import React from 'react';
import getPlaceholderImageURL from '../../util/getPlaceholderImageURL';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import fetch from '../../util/fetch';

class FollowSuggestions extends React.Component {
	constructor(props) {
		super(props);
		this.followPodcast = this.followPodcast.bind(this);
		this.unfollowPodcast = this.unfollowPodcast.bind(this);
	}
	followPodcast(podcastID) {
		this.props.dispatch({
			podcastID,
			type: 'FOLLOW_PODCAST',
			userID: localStorage['authedUser'],
		});
		// (dispatch is synchronous)
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
		// (dispatch is synchronous)
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
		if (this.props.podcasts.length === 0) {
			return null;
		} else {
			return (
				<div className="panel follow-suggestions">
					<div className="panel-header">Follow Suggestions</div>
					{this.props.podcasts.map((podcast, i) => {
						return (
							<Link
								className="panel-element"
								key={i}
								to={`/podcasts/${podcast._id}`}
							>
								<div className="left">
									<Img
										src={[
											podcast.images.favicon,
											getPlaceholderImageURL(podcast._id),
										]}
									/>
								</div>
								<div className="center">{podcast.title}</div>
								<div
									className={`right clickable ${
										this.props.follows[podcast._id] ? 'active' : ''
									}`}
									onClick={e => {
										e.stopPropagation();
										e.preventDefault();
										if (this.props.follows[podcast._id]) {
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
				</div>
			);
		}
	}
}

FollowSuggestions.defaultProps = {
	podcasts: [],
};

FollowSuggestions.propTypes = {
	dispatch: PropTypes.func.isRequired,
	follows: PropTypes.arrayOf(PropTypes.shape({})),
	podcasts: PropTypes.arrayOf(PropTypes.shape({})),
};

const mapStateToProps = (state, ownProps) => {
	// just grab an object with all the follows, and return that
	let followedPodcasts = {};
	if (state.followedPodcasts && state.followedPodcasts[localStorage['authedUser']]) {
		followedPodcasts = state.followedPodcasts[localStorage['authedUser']];
	}
	return { ...ownProps, follows: followedPodcasts };
};

export default connect(mapStateToProps)(FollowSuggestions);
