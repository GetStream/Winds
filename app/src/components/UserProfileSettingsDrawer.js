import saveIcon from '..//images/icons/save.svg';
import Avatar from './Avatar';
import Drawer from './Drawer';
import Img from 'react-image';
import Popover from 'react-popover';
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
			deleteAccountPopoverIsOpen: false,
			dailyNotifications,
			followNotifications,
			password: '',
			weeklyNotifications,
		};

		this.toggleDeleteAccountPopover = this.toggleDeleteAccountPopover.bind(this);
		this.handleDeleteAccountConfirmationClick = this.handleDeleteAccountConfirmationClick.bind(
			this,
		);
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

	toggleDeleteAccountPopover(e) {
		e.preventDefault();

		this.setState({
			deleteAccountPopoverIsOpen: !this.state.deleteAccountPopoverIsOpen,
		});
	}

	handleDeleteAccountConfirmationClick(e) {
		e.preventDefault();
		e.stopPropagation();

		fetch('DELETE', `/users/${this.props._id}`)
			.then(() => {
				this.props.closeDrawer();
				localStorage.clear();
				window.location.reload();
			})
			.catch(err => {
				if (window.console) {
					console.log(err); // eslint-disable-line no-console
				}
			});
	}

	handleAccountFormSubmit(e) {
		e.preventDefault();
		e.stopPropagation();

		const {
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
			.then(res => {
				this.props.updateUser(res.data);
				this.props.closeDrawer();
			})
			.catch(err => {
				this.props.closeDrawer();
			});
	}

	passwordIsValid() {
		return (
			this.state.password === this.state.confirmPassword &&
			this.state.password.trim() !== ''
		);
	}

	handlePasswordFormSubmit(e) {
		e.preventDefault();

		if (this.passwordIsValid()) {
			fetch('PUT', `/users/${this.props._id}`, {
				password: this.state.password,
			})
				.then(res => {
					this.props.updateUser(res.data);
					this.props.closeDrawer();
				})
				.catch(err => {
					this.props.closeDrawer();
				});
		}
	}

	downloadOPML() {
		fetch('GET', `/opml/download`)
			.then(res => {
				if (res.data) {
					const link = document.createElement('a');
					const blob = new Blob([res.data], { type: 'text/xml' });
					link.href = URL.createObjectURL(blob);
					link.download = 'export.xml';
					link.click();
				}
			})
			.catch(err => {
				if (window.console) console.log(err); // eslint-disable-line no-console
			});
	}

	render() {
		const deleteAccountPopover = (
			<div className="popover-panel delete-account-confirmation-popover">
				<div className="panel-element">
					<div className="header">
						<h3>Delete Account</h3>
						<p className="message">
							<strong>Warning:</strong> This cannot be undone.
						</p>
					</div>
				</div>
				<div
					className="panel-element menu-item"
					onClick={this.handleDeleteAccountConfirmationClick}
				>
					<span>Yes - Delete my account</span>
				</div>
				<div
					className="panel-element menu-item"
					onClick={this.toggleDeleteAccountPopover}
				>
					<span>Cancel</span>
				</div>
			</div>
		);

		const accountTab = (
			<form id="settings-account-form" onSubmit={this.handleAccountFormSubmit}>
				<a
					className="change-avatar"
					href="https://en.gravatar.com/"
					rel="noopener noreferrer"
					target="_blank"
				>
					<Avatar
						gravatarURL={this.props.gravatar}
						height={50}
						userID={this.props._id}
						width={50}
					/>
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
						placeholder="Your Bio (280 character max)"
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
					<div className="secondary">
						<Popover
							body={deleteAccountPopover}
							isOpen={this.state.deleteAccountPopoverIsOpen}
							onOuterAction={this.toggleDeleteAccountPopover}
							preferPlace="above"
							tipSize={0.1}
						>
							<button
								className="btn link cancel"
								onClick={this.toggleDeleteAccountPopover}
								type="button"
							>
								Delete account
							</button>
						</Popover>
					</div>
					<div
						className="btn primary export"
						onClick={() => this.downloadOPML()}
					>
						Export OPML
					</div>
					<button className="btn primary with-circular-icon" type="submit">
						<Img decode={false} src={saveIcon} />
						<span>Save</span>
					</button>
				</footer>
			</form>
		);

		const passwordTab = (
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
						<Img decode={false} src={saveIcon} />
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
						decode={false}
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
	gravatar: PropTypes.string,
};

const mapStateToProps = state => {
	return { ...state.users[localStorage['authedUser']], ...state.userSettings };
};

const mapDispatchToProps = dispatch => {
	return {
		getUserInfo: () => {
			fetch('GET', `/users/${localStorage['authedUser']}`)
				.then(res => {
					dispatch({ type: 'UPDATE_USER_SETTINGS', user: res.data });
				})
				.catch(err => {
					if (window.console) {
						console.log(err); // eslint-disable-line no-console
					}
				});
		},
		updateUser: user => {
			dispatch({ type: 'UPDATE_USER', user });
		},
	};
};

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(UserProfileSettingsDrawer);
