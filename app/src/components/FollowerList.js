import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import fetch from '../util/fetch';
import Avatar from './Avatar';
import { Link } from 'react-router-dom';

class FollowerList extends React.Component {
	componentDidMount() {
		// if this.props.type == rss, get followers for rss, and vice versa
		if (this.props.type !== 'rss' && this.props.type !== 'podcast') {
			// just in case a type isn't provided
			return;
		}

		// get a list of all the followers of this podcast / rss feed, put into redux

		fetch('GET', '/follows', null, { [this.props.type]: this.props.id }).then(
			response => {
				for (let followRelationship of response.data) {
					// dispatch user update
					this.props.dispatch({
						type: 'UPDATE_USER',
						user: followRelationship.user,
					});

					// if type == rss, update all the rss feeds
					if (this.props.type === 'rss') {
						// dispatch RSS feed update
						this.props.dispatch({
							rssFeed: followRelationship.rss,
							type: 'UPDATE_RSS_FEED',
						});
						// dispatch follow relationship update
						this.props.dispatch({
							rssFeedID: followRelationship.rss._id,
							type: 'FOLLOW_RSS_FEED',
							userID: followRelationship.user._id,
						});
					} else if (this.props.type === 'podcast') {
						this.props.dispatch({
							podcast: followRelationship.podcast,
							type: 'UPDATE_PODCAST_SHOW',
						});
						this.props.dispatch({
							podcastID: followRelationship.podcast._id,
							type: 'FOLLOW_PODCAST',
							userID: followRelationship.user._id,
						});
					}
				}
			},
		);
	}
	render() {
		return (
			<div className="follow-suggestions-section">
				<label>Followers</label>
				<div className="follow-suggestions">
					{this.props.users.map(user => {
						return (
							<Link
								className="follow-suggestion"
								key={user._id}
								to={`/profile/${user._id}`}
							>
								<Avatar height={50} width={50}>
									{user.email}
								</Avatar>
								<div className="info">{user.name}</div>
							</Link>
						);
					})}
				</div>
			</div>
		);
	}
}

FollowerList.propTypes = {
	dispatch: PropTypes.func.isRequired,
	id: PropTypes.string.isRequired,
	type: PropTypes.string.isRequired,
	users: PropTypes.arrayOf(PropTypes.shape({})),
};

const mapStateToProps = (state, ownProps) => {
	let users = [];
	if (ownProps.type === 'rss') {
		for (let userID in state.followedRssFeeds) {
			if (state.followedRssFeeds.hasOwnProperty(userID)) {
				if (state.followedRssFeeds[userID][ownProps.id]) {
					users.push({ ...state.users[userID] });
				}
			}
		}
	} else if (ownProps.type === 'podcast') {
		for (let userID in state.followedPodcasts) {
			if (state.followedPodcasts.hasOwnProperty(userID)) {
				if (state.followedPodcasts[userID][ownProps.id]) {
					users.push({ ...state.users[userID] });
				}
			}
		}
	}

	return { ...ownProps, users };
};

const mapDispatchToProps = (dispatch, ownProps) => {
	return { ...ownProps, dispatch };
};

export default connect(mapStateToProps, mapDispatchToProps)(FollowerList);
