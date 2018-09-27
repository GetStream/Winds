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
		if (this.props.podcasts.length) return;

		fetch('GET', '/podcasts', {}, { type: 'recommended' })
			.then(res => {
				this.props.dispatch({
					podcasts: res.data,
					type: 'BATCH_UPDATE_PODCASTS',
				});

				this.props.dispatch({
					podcasts: res.data,
					type: 'UPDATE_SUGGESTED_PODCASTS',
				});
			})
			.catch(err => {
				if (window.console) {
					console.log(err); // eslint-disable-line no-console
				}
			});

		fetch('GET', '/follows', null, { type: 'podcast' })
			.then(res => {
				this.props.dispatch({
					type: 'UPDATE_USER',
					user: res.data[0].user,
				});

				let podcasts = [];
				let podcastFollowRelationships = [];

				for (let followRelationship of res.data) {
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
				if (window.console) {
					console.log(err); // eslint-disable-line no-console
				}
			});
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
