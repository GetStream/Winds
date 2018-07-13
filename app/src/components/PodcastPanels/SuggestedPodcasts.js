import { Link } from 'react-router-dom';
import getPlaceholderImageURL from '../../util/getPlaceholderImageURL';
import Img from 'react-image';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import fetch from '../../util/fetch';
import Panel from '../Panel';

class SuggestedPodcasts extends React.Component {
	componentDidMount() {
		fetch('GET', '/podcasts', {}, { type: 'recommended' })
			.then(response => {
				this.props.dispatch({
					podcasts: response.data,
					type: 'BATCH_UPDATE_PODCASTS',
				});

				// dispatch follow suggestion updates
				this.props.dispatch({
					podcasts: response.data,
					type: 'UPDATE_SUGGESTED_PODCASTS',
				});
			})
			.catch(err => {
				console.log(err); // eslint-disable-line no-console
			});

		fetch('GET', '/follows', null, { type: 'podcast' })
			.then(response => {
				// update the user
				this.props.dispatch({
					type: 'UPDATE_USER',
					user: response.data[0].user,
				});
				let podcasts = [];
				let podcastFollowRelationships = [];
				for (let followRelationship of response.data) {
					podcasts.push(followRelationship.podcast);
					podcastFollowRelationships.push({
						podcastID: followRelationship.podcast._id,
						userID: followRelationship.user._id,
					});
				}

				this.props.dispatch({
					podcasts,
					type: 'BATCH_UPDATE_PODCASTS',
				});
				this.props.dispatch({
					podcastFollowRelationships,
					type: 'BATCH_FOLLOW_PODCASTS',
				});
			})
			.catch(err => {
				console.log(err); // eslint-disable-line no-console
			});
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
		return (
			<Panel headerText="Suggested Podcasts">
				{this.props.podcasts.map(podcast => {
					return (
						<Link key={podcast._id} to={`/podcasts/${podcast._id}`}>
							<Img
								src={[
									podcast.images.favicon,
									getPlaceholderImageURL(podcast._id),
								]}
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
	// just grab an object with all the follows, and return that
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
