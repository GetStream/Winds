import saveIcon from '..//images/icons/save.svg';
import Avatar from './Avatar';
import Drawer from './Drawer';
import Img from 'react-image';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import fetch from '../util/fetch';

class UserProfileSettingsDrawer extends React.Component {
	constructor(props) {
		super(props);

		let dailyNotifications = false;
		let weeklyNotifications = false;
		let followNotifications = false;
		if (props.preferences && props.preferences.notifications) {
			dailyNotifications = props.preferences.notifications.daily;
			weeklyNotifications = props.preferences.notifications.weekly;
			followNotifications = props.preferences.notifications.follows;
		}

		this.state = { ...props };

		this.state = {
			confirmPassword: '',
			currentTab: 'account',
			dailyNotifications,
			followNotifications,
			password: '',
			weeklyNotifications,
		};
		this.handleAccountFormSubmit = this.handleAccountFormSubmit.bind(this);
		this.handlePasswordFormSubmit = this.handlePasswordFormSubmit.bind(this);
	}
	componentDidMount() {
		this.props.getUserInfo();
	}
	componentWillReceiveProps(nextProps) {
		let dailyNotifications = false;
		let weeklyNotifications = false;
		let followNotifications = false;
		if (nextProps.preferences && nextProps.preferences.notifications) {
			dailyNotifications = nextProps.preferences.notifications.daily;
			weeklyNotifications = nextProps.preferences.notifications.weekly;
			followNotifications = nextProps.preferences.notifications.follows;
		}

		this.setState({
			...nextProps,
			currentTab: 'account',
			dailyNotifications,
			followNotifications,
			weeklyNotifications,
		});
	}
	handleAccountFormSubmit(e) {
		e.preventDefault();
		e.stopPropagation();

		let {
			background,
			email,
			username,
			name,
			bio,
			url,
			twitter,
			dailyNotifications,
			followNotifications,
			weeklyNotifications,
		} = this.state;
		fetch('PUT', `/users/${this.props._id}`, {
			background,
			bio,
			email,
			name,
			preferences: {
				notifications: {
					daily: dailyNotifications,
					follows: followNotifications,
					weekly: weeklyNotifications,
				},
			},
			twitter,
			url,
			username,
		})
			.then(response => {
				this.props.updateUser(response.data);
				this.props.closeDrawer();
			})
			.catch(err => {
				console.log(err); // eslint-disable-line no-console
			});
	}
	handlePasswordFormSubmit(e) {
		e.preventDefault();
		if (this.passwordIsValid()) {
			// submit form
			fetch('PUT', `/users/${this.props._id}`, {
				password: this.state.password,
			})
				.then(response => {
					this.props.updateUser(response.data);
					this.props.closeDrawer();
				})
				.catch(err => {
					console.log(err); // eslint-disable-line no-console
				});
		}
	}
	passwordIsValid() {
		return (
			this.state.password === this.state.confirmPassword &&
			this.state.password.trim() !== ''
		);
	}
	render() {
		let accountTab = (
			<form id="settings-account-form" onSubmit={this.handleAccountFormSubmit}>
				<a
					className="change-avatar"
					href="https://en.gravatar.com/"
					rel="noopener noreferrer"
					target="_blank"
				>
					<Avatar height={50} width={50}>
						{this.props.email}
					</Avatar>
				</a>
				<div className="form-section">
					<input
						onChange={e => {
							this.setState({
								email: e.target.value,
							});
						}}
						placeholder="Your Email"
						type="text"
						value={this.state.email}
					/>
					<input
						onChange={e => {
							this.setState({
								name: e.target.value,
							});
						}}
						placeholder="Your Full Name"
						type="text"
						value={this.state.name}
					/>
					<input
						onChange={e => {
							this.setState({
								username: e.target.value,
							});
						}}
						placeholder="Your Username"
						type="text"
						value={this.state.username}
					/>
					<textarea
						maxLength="280"
						onChange={e => {
							this.setState({
								bio: e.target.value,
							});
						}}
						placeholder="Your Bio (240 character max)"
						value={this.state.bio}
					/>
				</div>
				<div className="form-section">
					<h2>Website & Social</h2>
					<input
						onChange={e => {
							this.setState({
								url: e.target.value,
							});
						}}
						placeholder="Your Website URL"
						type="url"
						value={this.state.url}
					/>
					<input
						maxLength="50"
						onChange={e => {
							this.setState({
								twitter: e.target.value,
							});
						}}
						placeholder="Your Twitter Handle (e.g. @nickparsons)"
						type="text"
						value={this.state.twitter}
					/>
				</div>
				<div className="form-section">
					<h2>Email Notifications</h2>
					<label className="checkbox">
						<input
							checked={this.state.dailyNotifications}
							onChange={() => {
								this.setState({
									dailyNotifications: !this.state.dailyNotifications,
								});
							}}
							type="checkbox"
						/>
						<span>Daily Digests</span>
					</label>
					<label className="checkbox">
						<input
							checked={this.state.weeklyNotifications}
							onChange={() => {
								this.setState({
									weeklyNotifications: !this.state.weeklyNotifications,
								});
							}}
							type="checkbox"
						/>
						<span>Weekly Digests</span>
					</label>
					<label className="checkbox">
						<input
							checked={this.state.followNotifications}
							onChange={() => {
								this.setState({
									followNotifications: !this.state.followNotifications,
								});
							}}
							type="checkbox"
						/>
						<span>Follow Notifications</span>
					</label>
				</div>
				<footer>
					<button className="btn primary with-circular-icon" type="submit">
						<Img src={saveIcon} />
						<span>Save</span>
					</button>
				</footer>
			</form>
		);

		let passwordTab = (
			<form id="settings-password-form" onSubmit={this.handlePasswordFormSubmit}>
				<div className="form-section">
					<h2>Change Password</h2>
					<input
						onChange={e => {
							this.setState({
								password: e.target.value,
							});
						}}
						placeholder="New Password"
						type="password"
						value={this.state.password}
					/>
					<input
						onChange={e => {
							this.setState({
								confirmPassword: e.target.value,
							});
						}}
						placeholder="Confirm New Password"
						type="password"
						value={this.state.confirmPassword}
					/>
				</div>
				<footer>
					<button
						className="btn primary with-circular-icon"
						disabled={!this.passwordIsValid()}
						type="submit"
					>
						<Img src={saveIcon} />
						<span>Save</span>
					</button>
				</footer>
			</form>
		);

		return (
			<Drawer
				className="user-settings-drawer"
				closeDrawer={this.props.closeDrawer}
				isOpen={this.props.isOpen}
			>
				<header>
					<h1>Settings</h1>
					<Img
						className="close-icon"
						onClick={this.props.closeDrawer}
						src="/images/buttons/close.svg"
					/>
				</header>
				<ul className="tabs">
					<li
						className={`tab ${
							this.state.currentTab === 'account' ? 'active' : null
						}`}
						onClick={() => {
							this.setState({
								currentTab: 'account',
							});
						}}
					>
						Account
					</li>
					<li
						className={`tab ${
							this.state.currentTab === 'password' ? 'active' : null
						}`}
						onClick={() => {
							this.setState({
								currentTab: 'password',
							});
						}}
					>
						Password
					</li>
				</ul>
				{this.state.currentTab === 'password' ? passwordTab : accountTab}
			</Drawer>
		);
	}
}

UserProfileSettingsDrawer.defaultProps = {
	background: 1,
	bio: '',
	email: '',
	isOpen: false,
	name: '',
	twitter: '',
	url: '',
	username: '',
};

UserProfileSettingsDrawer.propTypes = {
	_id: PropTypes.string,
	bio: PropTypes.string,
	closeDrawer: PropTypes.func.isRequired,
	email: PropTypes.string,
	getUserInfo: PropTypes.func.isRequired,
	isOpen: PropTypes.bool,
	name: PropTypes.string,
	preferences: PropTypes.shape({
		notifications: PropTypes.shape({
			daily: PropTypes.bool,
			follows: PropTypes.bool,
			weekly: PropTypes.bool,
		}),
	}),
	twitter: PropTypes.string,
	updateUser: PropTypes.func.isRequired,
	url: PropTypes.string,
	username: PropTypes.string,
};

const mapStateToProps = state => {
	return { ...state.users[localStorage['authedUser']], ...state.userSettings };
};

const mapDispatchToProps = dispatch => {
	return {
		getUserInfo: () => {
			fetch('GET', `/users/${localStorage['authedUser']}`)
				.then(response => {
					dispatch({ type: 'UPDATE_USER_SETTINGS', user: response.data });
				})
				.catch(err => {
					console.log(err); // eslint-disable-line no-console
				});
		},
		updateUser: user => {
			dispatch({ type: 'UPDATE_USER', user });
		},
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(UserProfileSettingsDrawer);
