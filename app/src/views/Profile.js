import Loader from '../components/Loader.js';
import MyPlaylists from '../components/MyPlaylists';
import MySubscriptions from '../components/MySubscriptions';
import NewShareForm from '../components/NewShareForm';
import PropTypes from 'prop-types';
import React from 'react';
import UserFeed from '../components/UserFeed';
import UserFollowSuggestions from '../components/UserFollowSuggestions';
import UserProfileCard from '../components/UserProfileCard';
import { connect } from 'react-redux';
import fetch from '../util/fetch';

class Profile extends React.Component {
	componentDidMount() {
		this.props.getUserInfo(this.props.user._id);
	}
	render() {
		if (this.props.loading) {
			return <Loader />;
		} else {
			return (
				<div className="profile three-columns">
					<div className="column">
						<UserProfileCard
							isLoggedInUser={this.props.isLoggedInUser}
							{...this.props.user}
						/>
						<NewShareForm />
						<UserFollowSuggestions />
					</div>
					<div className="column">
						<UserFeed userID={this.props.user._id} />
					</div>
					<div className="column">
						<MyPlaylists />
						<MySubscriptions />
					</div>
				</div>
			);
		}
	}
}

Profile.defaultProps = {
	isLoggedInUser: false,
	loading: true,
};

Profile.propTypes = {
	getUserInfo: PropTypes.func.isRequired,
	isLoggedInUser: PropTypes.bool,
	loading: PropTypes.bool,
	match: PropTypes.shape({
		params: PropTypes.shape({ userID: PropTypes.string }),
	}),
	signout: PropTypes.func,
	user: PropTypes.shape({
		_id: PropTypes.string,
		email: PropTypes.string,
	}),
};

const mapStateToProps = (state, ownProps) => {
	let user;
	let loading = false;
	// if a userID is provided in props, look up the user in Redux and include it. otherwise, just include the user on the redux user object (which is the signed in user)
	// we check route to get userID....
	if (ownProps.match.params.userID) {
		// ....but if we don't actually have the user yet, we need to go out and fetch it
		if (ownProps.match.params.userID in state.users) {
			user = state.users[ownProps.match.params.userID];
		} else {
			user = { _id: ownProps.match.params.userID };
			loading = true;
		}
	} else {
		user = state.users[localStorage['authedUser']];
	}
	return {
		isLoggedInUser: user._id === localStorage['authedUser'],
		loading,
		user,
		...ownProps,
	};
};

const mapDispatchToProps = dispatch => {
	return {
		getUserInfo: userID => {
			fetch('GET', `/users/${userID}`)
				.then(res => {
					dispatch({
						type: 'UPDATE_USER',
						user: res.data,
					});
				})
				.catch(err => {
					console.log(err); // eslint-disable-line no-console
				});
		},
	};
};

const mergeProps = (stateProps, dispatchProps) => {
	const { getUserInfo } = dispatchProps;
	let finalProps = {
		getUserInfo: userID => {
			getUserInfo(userID);
		},
		...stateProps,
		...dispatchProps,
	};
	return finalProps;
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(Profile);
