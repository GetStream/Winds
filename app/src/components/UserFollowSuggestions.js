import Avatar from './Avatar';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import fetch from '../util/fetch';

class UserFollowSuggestions extends React.Component {
	componentDidMount() {
		this.props.getFollowSuggestions();
		this.props.getFollowerUsers(this.props.currentUserID);
		this.props.getFollowingUsers(this.props.currentUserID);
	}

	render() {
		return (
			<div className="follow-suggestions">
				<h2>Follow Suggestions</h2>
				{this.props.suggestions.map((suggestion, i) => {
					return (
						<Link
							className="follow-suggestion"
							key={i}
							to={`/profile/${suggestion._id}`}
						>
							<Avatar height={50} width={50}>
								{suggestion.email}
							</Avatar>
							<div className="info">
								<div className="name">{suggestion.name}</div>
								<div className="username">{suggestion.username}</div>
							</div>
							{suggestion.following ? (
								<div
									className="follow clickable active"
									onClick={e => {
										e.preventDefault();
										this.props.unfollowUser(suggestion._id);
									}}
								>
									Followed
								</div>
							) : (
								<div
									className="follow clickable"
									onClick={e => {
										e.preventDefault();
										this.props.followUser(suggestion._id);
									}}
								>
									Follow
								</div>
							)}
						</Link>
					);
				})}
			</div>
		);
	}
}

UserFollowSuggestions.defaultProps = {
	suggestions: [],
};

UserFollowSuggestions.propTypes = {
	currentUserID: PropTypes.string.isRequired,
	followUser: PropTypes.func.isRequired,
	getFollowSuggestions: PropTypes.func.isRequired,
	getFollowerUsers: PropTypes.func.isRequired,
	getFollowingUsers: PropTypes.func.isRequired,
	suggestions: PropTypes.array,
	unfollowUser: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
	let suggestions;

	if (state.suggestions && state.suggestions.users) {
		// hydrate users
		suggestions = state.suggestions.users.map(userID => {
			let following = false;
			if (
				'follows' in state &&
				localStorage['authedUser'] in state.follows &&
				state.follows[localStorage['authedUser']][userID] === true
			) {
				following = true;
			}
			return { ...state.users[userID], following };
		});
	} else {
		suggestions = [];
	}

	return {
		currentUserID: localStorage['authedUser'],
		suggestions,
		userID: localStorage['authedUser'],
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
		getFollowSuggestions: () => {
			fetch(
				'GET',
				'/users',
				{},
				{
					per_page: 5,
					type: 'recommended',
				},
			)
				.then(res => {
					dispatch({
						type: 'UPDATE_SUGGESTED_USERS',
						users: res.data,
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
			fetch(
				'DELETE',
				'/follows',
				{},
				{ from: fromUserID, to: toUserID, type: 'user' },
			)
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

const mergeProps = (stateProps, dispatchProps) => {
	const { currentUserID } = stateProps;

	return {
		...stateProps,
		...dispatchProps,
		followUser: toUserID => {
			dispatchProps.followUser(currentUserID, toUserID);
		},
		getFollowSuggestions: () => {
			dispatchProps.getFollowSuggestions(stateProps.userID);
		},
		unfollowUser: toUserID => {
			dispatchProps.unfollowUser(currentUserID, toUserID);
		},
	};
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(
	UserFollowSuggestions,
);
