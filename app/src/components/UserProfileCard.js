import Avatar from './Avatar';
import FollowerCount from './FollowerCount';
import FollowingCount from './FollowingCount';
import PropTypes from 'prop-types';
import React from 'react';
import UserProfileSettingsDrawer from './UserProfileSettingsDrawer';
import { connect } from 'react-redux';

import fetch from '../util/fetch';

class UserProfileCard extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			editProfileDrawerIsOpen: false,
		};
		this.handleButtonClick = this.handleButtonClick.bind(this);
	}
	componentDidMount() {
		// update all the following relationships for this user
		this.props.getFollowerUsers(this.props._id);
		this.props.getFollowingUsers(this.props._id);
	}
	componentWillReceiveProps(nextProps) {
		if (nextProps._id !== this.props._id) {
			nextProps.getFollowerUsers(nextProps._id);
			nextProps.getFollowingUsers(nextProps._id);
		}
	}
	handleButtonClick() {
		if (this.props.isLoggedInUser) {
			// do nothing
			this.setState({
				editProfileDrawerIsOpen: !this.state.editProfileDrawerIsOpen,
			});
		} else if (this.props.isFollowingThisUser) {
			this.props.unfollowUser(this.props._id);
		} else {
			this.props.followUser(this.props._id);
		}
	}
	render() {
		let button;
		if (this.props.isLoggedInUser) {
			button = (
				<button
					className="btn hollow alt no-focus"
					onClick={this.handleButtonClick}
				>
					Settings
				</button>
			);
		} else if (this.props.isFollowingThisUser) {
			button = (
				<button
					className="btn hollow alt selected no-focus"
					onClick={this.handleButtonClick}
				>
					Following
				</button>
			);
		} else {
			button = (
				<button
					className="btn hollow alt no-focus"
					onClick={this.handleButtonClick}
				>
					Follow
				</button>
			);
		}

		let bio = null;

		if (this.props.bio) {
			bio = <p>{this.props.bio}</p>;
		}

		let url = null;

		if (this.props.url) {
			url = (
				<p>
					<a href={this.props.url} target="_blank">
						{this.props.url}
					</a>
				</p>
			);
		}

		let twitter = null;

		if (this.props.twitter) {
			twitter = (
				<p>
					<a href={`https://twitter.com/${this.props.twitter}`} target="_blank">
						<i className="fab fa-twitter" />
						<span>{this.props.twitter}</span>
					</a>
				</p>
			);
		}

		return (
			<div className="user-profile-card">
				<div
					className="top"
					style={{
						backgroundImage: `url(${require('../images/cards/pattern-' +
							this.props.background +
							'.png')})`,
					}}
				>
					<Avatar height={60} width={60}>
						{this.props.email}
					</Avatar>
					<div className="info">
						<div className="name">{this.props.name}</div>
						<div className="username">{this.props.username}</div>
						<div className="follows">
							<FollowerCount
								displayFollowButtons={this.props.isLoggedInUser}
								followUser={this.props.followUser}
								followerUsers={this.props.followerUsers}
								forUserID={this.props._id}
								unfollowUser={this.props.unfollowUser}
							/>
							<FollowingCount
								displayFollowButtons={this.props.isLoggedInUser}
								followUser={this.props.followUser}
								followingUsers={this.props.followingUsers}
								forUserID={this.props._id}
								unfollowUser={this.props.unfollowUser}
							/>
						</div>
					</div>
					<div className="interact">{button}</div>
					<UserProfileSettingsDrawer
						closeDrawer={this.handleButtonClick}
						isOpen={this.state.editProfileDrawerIsOpen}
					/>
				</div>
				<div className="bottom">
					{bio}
					{url}
					{twitter}
				</div>
			</div>
		);
	}
}

UserProfileCard.propTypes = {
	_id: PropTypes.string.isRequired,
	background: PropTypes.number,
	bio: PropTypes.string,
	email: PropTypes.string.isRequired,
	followUser: PropTypes.func.isRequired,
	followerUsers: PropTypes.arrayOf(PropTypes.object),
	followingUsers: PropTypes.arrayOf(PropTypes.object),
	getFollowerUsers: PropTypes.func.isRequired,
	getFollowingUsers: PropTypes.func.isRequired,
	isFollowingThisUser: PropTypes.bool,
	isLoggedInUser: PropTypes.bool,
	name: PropTypes.string.isRequired,
	twitter: PropTypes.string,
	unfollowUser: PropTypes.func.isRequired,
	url: PropTypes.string,
	username: PropTypes.string.isRequired,
};

UserProfileCard.defaultProps = {
	background: 1,
	bio: '',
	isFollowingThisUser: false,
	isLoggedInUser: false,
	twitter: '',
	url: '',
};

const mapStateToProps = (state, ownProps) => {
	// grab all followers for this user

	// look through all keys in state.follows
	let followerUsers = [];
	let allUserIDs = [];
	if (state.follows) {
		allUserIDs = Object.keys(state.follows);
	}
	for (let user of allUserIDs) {
		if (
			ownProps._id in state.follows[user] &&
			state.follows[user][ownProps._id] === true
		) {
			followerUsers.push(state.users[user]);
		}
	}

	let followingUsers = [];
	if (state.follows && ownProps._id in state.follows) {
		for (let userID of Object.keys(state.follows[ownProps._id])) {
			if (state.follows[ownProps._id][userID]) {
				followingUsers.push(state.users[userID]);
			}
		}
	}

	// grab all the users this user is following

	// look through follow relationships to see if the current user is following the target user

	let isFollowingThisUser = false;
	if (
		'follows' in state &&
		localStorage['authedUser'] in state.follows &&
		state.follows[localStorage['authedUser']][ownProps._id] === true
	) {
		isFollowingThisUser = true;
	}

	return {
		currentUserID: localStorage['authedUser'],
		followerUsers,
		followingUsers,
		isFollowingThisUser,
		...state.users[ownProps._id],
	};
};
const mapDispatchToProps = dispatch => {
	return {
		followUser: (fromUserID, toUserID) => {
			fetch('POST', '/follows', { followee: toUserID }, { type: 'user' })
				.then(() => {
					dispatch({
						fromUserID,
						toUserID,
						type: 'FOLLOW_USER',
					});
				})
				.catch(err => {
					console.log(err); // eslint-disable-line no-console
				});
		},
		getFollowerUsers: forUserID => {
			fetch('GET', `/users/${forUserID}/followers`, {}, { type: 'followee' })
				.then(res => {
					for (let user of res.data) {
						dispatch({ type: 'UPDATE_USER', user });
						dispatch({
							followeeID: forUserID,
							type: 'UPDATE_FOLLOWING_USER',
							userID: user._id,
						});
					}
				})
				.catch(err => {
					console.log(err); // eslint-disable-line no-console
				});
		},
		getFollowingUsers: forUserID => {
			fetch('GET', `/users/${forUserID}/following`, {}, { type: 'followee' })
				.then(res => {
					for (let user of res.data) {
						dispatch({ type: 'UPDATE_USER', user });
						dispatch({
							followeeID: user._id,
							type: 'UPDATE_FOLLOWING_USER',
							userID: forUserID,
						});
					}
				})
				.catch(err => {
					console.log(err); // eslint-disable-line no-console
				});
		},
		unfollowUser: (fromUserID, toUserID) => {
			fetch('DELETE', '/follows', {}, { followee: toUserID, type: 'user' })
				.then(() => {
					dispatch({
						fromUserID,
						toUserID,
						type: 'UNFOLLOW_USER',
					});
				})
				.catch(err => {
					console.log(err); // eslint-disable-line no-console
				});
		},
	};
};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
	const { currentUserID } = stateProps;
	return {
		...dispatchProps,
		followUser: toUserID => {
			dispatchProps.followUser(currentUserID, toUserID);
		},
		unfollowUser: toUserID => {
			dispatchProps.unfollowUser(currentUserID, toUserID);
		},
		...stateProps,
		...ownProps,
	};
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(UserProfileCard);
