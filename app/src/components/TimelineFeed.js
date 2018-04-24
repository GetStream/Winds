import FeedActivity from './Activities/FeedActivity';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import fetch from '../util/fetch';
import { getActivity } from '../selectors';

class TimelineFeed extends React.Component {
	componentDidMount() {
		this.props.getActivities();
	}
	render() {
		return (
			<div className="activity-feed-wrapper">
				{this.props.feedActivities.map(feedActivity => {
					return <FeedActivity key={feedActivity._id} {...feedActivity} />;
				})}
			</div>
		);
	}
}

TimelineFeed.propTypes = {
	feedActivities: PropTypes.array,
	getActivities: PropTypes.func,
	user: PropTypes.object,
};

const mapStateToProps = state => {
	// look up feed for this user
	// timeline:userID
	// hydrate all the activities for this feed into feedActivities
	let usersTimelineFeed = [];
	if (state.feeds && state.feeds[`timeline:${localStorage['authedUser']}`]) {
		usersTimelineFeed = state.feeds[`timeline:${localStorage['authedUser']}`];
	}
	let feedActivities = usersTimelineFeed.map(activityID => {
		return getActivity(state, activityID);
	});

	return {
		feedActivities,
		user: state.users[localStorage['authedUser']],
	};
};

const mapDispatchToProps = dispatch => {
	return {
		getActivities: userID => {
			fetch(
				'GET',
				`/users/${userID}/feeds`,
				{},
				{
					type: 'timeline',
				},
			)
				.then(res => {
					for (let activity of res.data) {
						if (activity.type === 'share') {
							dispatch({
								type: 'UPDATE_USER',
								user: activity.user,
							});
							dispatch({
								share: activity,
								type: 'UPDATE_SHARE',
							});
						} else if (activity.type === 'episode') {
							// update podcast
							dispatch({
								podcast: activity.podcast,
								type: 'UPDATE_PODCAST_SHOW',
							});
							// update episode
							dispatch({
								episode: activity,
								type: 'UPDATE_EPISODE',
							});
							// update activity
						} else if (activity.type === 'article') {
							// update rss feed
							dispatch({
								rssFeed: activity.rss,
								type: 'UPDATE_RSS_FEED',
							});
							// update article
							dispatch({
								rssArticle: activity,
								type: 'UPDATE_ARTICLE',
							});
						}
					}

					// sorting before putting in redux
					let sortedActivities = res.data.sort((a, b) => {
						// sorting - needs to account for publication date vs creation date. episodes and articles have publication date, shares do not.
						if (a.publicationDate && b.publicationDate) {
							return (
								new Date(b.publicationDate).valueOf() -
								new Date(a.publicationDate).valueOf()
							);
						} else if (a.publicationDate && !b.publicationDate) {
							return (
								new Date(b.createdAt).valueOf() -
								new Date(a.publicationDate).valueOf()
							);
						} else if (!a.publicationDate && b.publicationDate) {
							return (
								new Date(b.publicationDate).valueOf() -
								new Date(a.createdAt).valueOf()
							);
						} else {
							return (
								new Date(b.createdAt).valueOf() -
								new Date(a.createdAt).valueOf()
							);
						}
					});

					dispatch({
						activities: sortedActivities,
						feedID: `timeline:${userID}`,
						type: 'UPDATE_FEED',
					});
				})
				.catch(err => {
					console.log(err); // eslint-disable-line no-console
				});
		},
	};
};

const mergeProps = (stateProps, dispatchProps) => {
	const { getActivities } = dispatchProps;
	return {
		...stateProps,
		getActivities: () => {
			getActivities(stateProps.user._id);
		},
	};
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(TimelineFeed);
