import FeedActivity from './Activities/FeedActivity';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { getActivity } from '../selectors';
import getFeedActivities from '../util/getFeedActivities';

class UserFeed extends React.Component {
	componentDidMount() {
		this.props.getActivities(this.props.userID);
	}
	componentWillReceiveProps(nextProps) {
		if (nextProps.userID !== this.props.userID) {
			this.props.getActivities(nextProps.userID);
		}
	}
	render() {
		let sortedActivities = this.props.feedActivities.sort((a, b) => {
			return new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf();
		});

		return (
			<div className="activity-feed-wrapper">
				{sortedActivities.map(feedActivity => {
					return (
						<FeedActivity
							key={feedActivity._id}
							{...feedActivity}
							expandComments={false}
						/>
					);
				})}
			</div>
		);
	}
}

UserFeed.propTypes = {
	feedActivities: PropTypes.array,
	getActivities: PropTypes.func.isRequired,
	userID: PropTypes.string.isRequired,
};

UserFeed.defaultProps = {
	feedActivities: [],
};

const mapStateToProps = (state, ownProps) => {
	// look up feed for this user
	// hydrate all the activities for this feed into feedActivities
	let feedActivities = [];
	if (state.feeds) {
		let usersTimelineFeed = state.feeds[`user:${ownProps.userID}`];
		if (!usersTimelineFeed) {
			feedActivities = [];
		} else {
			feedActivities = usersTimelineFeed.map(activityID => {
				return getActivity(state, activityID);
			});
		}
	}

	return {
		feedActivities,
		user: state.users[ownProps.userID],
	};
};

const mapDispatchToProps = dispatch => {
	// provide a getActivities function
	return {
		getActivities: userID => {
			getFeedActivities(`user:${userID}`, window.localStorage.getItem('jwt'))
				.then(activities => {
					// dispatch events for each activity
					for (let activity of activities.data) {
						if (activity.type === 'share') {
							dispatch({
								type: 'UPDATE_USER',
								user: activity.user,
							});
							dispatch({
								share: activity,
								type: 'UPDATE_SHARE',
							});
						}
					}
					// then, dispatch event to update the list of activities in the feed
					dispatch({
						activities: activities.data,
						feedID: `user:${userID}`,
						type: 'UPDATE_FEED',
					});
				})
				.catch(err => {
					console.log(err); // eslint-disable-line no-console
				});
		},
	};
};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
	const { getActivities } = dispatchProps;
	return {
		...stateProps,
		...ownProps,
		getActivities: userID => {
			getActivities(userID);
		},
	};
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(UserFeed);
