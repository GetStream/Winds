import { Img } from 'react-image';
import Popover from 'react-popover';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Avatar from './Avatar';
import Drawer from './Drawer';
import fetch from '../util/fetch';
import { getUser } from '../api';

import closeIcon from '../images/buttons/close.svg';
import saveIcon from '../images/icons/save.svg';

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

		this.state = {
			...props,
			confirmPassword: '',
			currentTab: 'account',
			deleteAccountPopoverIsOpen: false,
			dailyNotifications,
			followNotifications,
			password: '',
			weeklyNotifications,
			exportError: false,
		};
	}

	componentDidMount() {
		getUser(this.props.dispatch, localStorage['authedUser']);
	}

	componentDidUpdate(prevProps) {
		if (!prevProps._id && this.props._id) this.setState({ ...this.state.props });
	}

	toggleDeleteAccountPopover = (e) => {
		e.preventDefault();

		this.setState({
			deleteAccountPopoverIsOpen: !this.state.deleteAccountPopoverIsOpen,
		});
	};

	handleDeleteAccountConfirmationClick = (e) => {
		e.preventDefault();
		e.stopPropagation();

		fetch('DELETE', `/users/${this.props._id}`)
			.then(() => {
				this.props.closeDrawer();
				localStorage.clear();
				window.location.reload();
			})
			.catch((err) => {
				console.log(err); // eslint-disable-line no-console
			});
	};

	handleAccountFormSubmit = (e) => {
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
			.then(() => {
				getUser(this.props.dispatch, localStorage['authedUser']);
				this.props.closeDrawer();
			})
			.catch(() => this.props.closeDrawer());
	};

	passwordIsValid = () => {
		return (
			this.state.password === this.state.confirmPassword &&
			this.state.password.trim() !== ''
		);
	};

	handlePasswordFormSubmit = (e) => {
		e.preventDefault();

		if (this.passwordIsValid()) {
			fetch('PUT', `/users/${this.props._id}`, {
				password: this.state.password,
			})
				.then(() => this.props.closeDrawer())
				.catch(() => this.props.closeDrawer());
		}
	};

	downloadOPML = () => {
		fetch('GET', '/opml/download')
			.then((res) => {
				if (res.data) {
					const link = document.createElement('a');
					const blob = new Blob([res.data], { type: 'text/xml' });
					link.href = URL.createObjectURL(blob);
					link.download = 'export.xml';
					link.click();
				}
			})
			.catch((err) => {
				this.setState({ exportError: true }, () => {
					setTimeout(() => this.setState({ exportError: false }), 1500);
				});

				console.log(err); // eslint-disable-line no-console
			});
	};

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
						onChange={(e) => this.setState({ email: e.target.value })}
						placeholder="Your Email"
						type="text"
						value={this.state.email}
					/>
					<input
						onChange={(e) => this.setState({ name: e.target.value })}
						placeholder="Your Full Name"
						type="text"
						value={this.state.name}
					/>
					<input
						onChange={(e) => this.setState({ username: e.target.value })}
						placeholder="Your Username"
						type="text"
						value={this.state.username}
					/>
					<textarea
						maxLength="280"
						onChange={(e) => this.setState({ bio: e.target.value })}
						placeholder="Your Bio (280 character max)"
						value={this.state.bio}
					/>
				</div>
				<div className="form-section">
					<h2>Website & Social</h2>
					<input
						onChange={(e) => this.setState({ url: e.target.value })}
						placeholder="Your Website URL"
						type="url"
						value={this.state.url}
					/>
					<input
						maxLength="50"
						onChange={(e) => this.setState({ twitter: e.target.value })}
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
							onChange={() =>
								this.setState((prevState) => ({
									dailyNotifications: !prevState.dailyNotifications,
								}))
							}
							type="checkbox"
						/>
						<span>Daily Digests</span>
					</label>
					<label className="checkbox">
						<input
							checked={this.state.weeklyNotifications}
							onChange={() =>
								this.setState((prevState) => ({
									weeklyNotifications: !prevState.weeklyNotifications,
								}))
							}
							type="checkbox"
						/>
						<span>Weekly Digests</span>
					</label>
					<label className="checkbox">
						<input
							checked={this.state.followNotifications}
							onChange={() =>
								this.setState((prevState) => ({
									followNotifications: !prevState.followNotifications,
								}))
							}
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
					<Popover
						body={
							<div className="popover-panel">
								<div className="panel-element">
									An Error occured, Please try again.
								</div>
							</div>
						}
						isOpen={this.state.exportError}
						preferPlace="above"
						tipSize={0.2}
					>
						<div className="btn primary export" onClick={this.downloadOPML}>
							Export OPML
						</div>
					</Popover>

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
						onChange={(e) => this.setState({ password: e.target.value })}
						placeholder="New Password"
						type="password"
						value={this.state.password}
					/>
					<input
						onChange={(e) =>
							this.setState({ confirmPassword: e.target.value })
						}
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
						src={closeIcon}
					/>
				</header>
				<ul className="tabs">
					<li
						className={`tab ${
							this.state.currentTab === 'account' ? 'active' : null
						}`}
						onClick={() => this.setState({ currentTab: 'account' })}
					>
						Account
					</li>
					<li
						className={`tab ${
							this.state.currentTab === 'password' ? 'active' : null
						}`}
						onClick={() => this.setState({ currentTab: 'password' })}
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
	preferences: {
		notifications: {
			daily: false,
			follows: false,
			weekly: false,
		},
	},
};

UserProfileSettingsDrawer.propTypes = {
	_id: PropTypes.string,
	bio: PropTypes.string,
	closeDrawer: PropTypes.func.isRequired,
	email: PropTypes.string,
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
	url: PropTypes.string,
	username: PropTypes.string,
	gravatar: PropTypes.string,
	dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({ ...state.user });

export default connect(mapStateToProps)(UserProfileSettingsDrawer);
