import UserProfileSettingsDrawer from './UserProfileSettingsDrawer';
import octocatDarkIcon from '../images/logos/octocat-dark.svg';
import backIcon from '../images/icons/back.svg';
import forwardIcon from '../images/icons/forward.svg';
import githubIcon from '../images/Octocat.png';
import homeIcon from '../images/icons/home.svg';
import refreshIcon from '../images/icons/refresh-black.svg';
import addIcon from '../images/icons/add.svg';
import { Link, withRouter } from 'react-router-dom';
import React, { Component } from 'react';
import Avatar from './Avatar';
import Img from 'react-image';
import PropTypes from 'prop-types';
import SearchBar from './SearchBar';
import { connect } from 'react-redux';
import Popover from 'react-popover';
import AddRSSModal from './AddRSSModal';
import AddPodcastModal from './AddPodcastModal';

class Header extends Component {
	constructor(props) {
		super(props);

		this.state = {
			editProfileDrawerIsOpen: false,
			githubPopoverIsOpen: false,
			newContentPopoverIsOpen: false,
			newPodcastModalIsOpen: false,
			newRSSModalIsOpen: false,
		};

		this.toggleGithubPopover = this.toggleGithubPopover.bind(this);
		this.toggleProfilePopover = this.toggleProfilePopover.bind(this);
		this.toggleNewContentPopover = this.toggleNewContentPopover.bind(this);
		this.toggleNewRSSModal = this.toggleNewRSSModal.bind(this);
		this.toggleNewPodcastModal = this.toggleNewPodcastModal.bind(this);
		this.closeDrawer = this.closeDrawer.bind(this);
	}

	toggleGithubPopover(e) {
		e.preventDefault();
		this.setState({
			githubPopoverIsOpen: !this.state.githubPopoverIsOpen,
		});
	}

	toggleNewContentPopover(e) {
		e.preventDefault();
		this.setState({
			newContentPopoverIsOpen: !this.state.newContentPopoverIsOpen,
		});
	}

	toggleNewRSSModal() {
		this.setState({
			newContentPopoverIsOpen: false,
			newRSSModalIsOpen: !this.state.newRSSModalIsOpen,
		});
	}

	toggleNewPodcastModal() {
		this.setState({
			newContentPopoverIsOpen: false,
			newPodcastModalIsOpen: !this.state.newPodcastModalIsOpen,
		});
	}

	toggleProfilePopover() {
		this.setState({
			profilePopoverIsOpen: !this.state.profilePopoverIsOpen,
		});
	}

	closeProfilePopover() {
		this.setState({
			profilePopoverIsOpen: false,
		});
	}

	closeDrawer() {
		this.setState({
			editProfileDrawerIsOpen: false,
		});
	}

	openDrawer() {
		this.setState({
			editProfileDrawerIsOpen: true,
		});
	}

	render() {
		const { location } = this.props;

		let profilePopover = (
			<div className="popover-panel profile-popover">
				<div className="panel-element user">
					<div className="avatar">
						<Avatar height={80} width={80}>
							{this.props.user.email}
						</Avatar>
					</div>
					<div className="user-info">
						<span className="name">{this.props.user.name}</span>
						<span className="username">{this.props.user.username}</span>
					</div>
					<div className="link-to-profile">
						<button
							className="btn primary alt"
							onClick={() => {
								this.openDrawer();
								this.closeProfilePopover();
							}}
						>
							Settings
						</button>
					</div>
				</div>
				{this.props.user.admin ? (
					<Link className="panel-element" to="/admin">
						admin section
					</Link>
				) : null}
				<div
					className="panel-element sign-out"
					onClick={() => {
						localStorage.clear();
						window.location.reload();
					}}
				>
					<span>Sign out</span>
					<span>
						<i className="fas fa-sign-out-alt" />
					</span>
				</div>
			</div>
		);

		let newContentPopover = (
			<div className="popover-panel new-content-popover">
				<div className="panel-element" onClick={this.toggleNewPodcastModal}>
					<i className="fas fa-podcast" />
					<span>New Podcast</span>
				</div>
				<div className="panel-element" onClick={this.toggleNewRSSModal}>
					<i className="fas fa-rss" />
					<span>New RSS</span>
				</div>
			</div>
		);

		// for the time being, setting up two github popovers - one for electron and one for web, to handle URLs correctly. will refactor later - <3, @kenhoff

		var userAgent = navigator.userAgent.toLowerCase();
		let isElectron = userAgent.indexOf(' electron/') > -1;
		let githubPopover;

		if (isElectron) {
			githubPopover = (
				<div className="popover-panel github-popover">
					<div
						className="top"
						onClick={e => {
							e.preventDefault();
							window.ipcRenderer.send(
								'open-external-window',
								'https://github.com/GetStream/Winds',
							);
						}}
					>
						<Img src={githubIcon} />
						<a
							className="gh-button"
							href="https://github.com/GetStream/Winds"
						>
							<span className="gh-button__title">
								<svg
									className="gh-button__icon gh-button__icon--github-logo"
									viewbox="0 0 1024 1024"
								>
									<path d="M512 0C229.252 0 0 229.25199999999995 0 512c0 226.251 146.688 418.126 350.155 485.813 25.593 4.686 34.937-11.125 34.937-24.626 0-12.188-0.469-52.562-0.718-95.314-128.708 23.46-161.707-31.541-172.469-60.373-5.525-14.809-30.407-60.249-52.398-72.263-17.988-9.828-43.26-33.237-0.917-33.735 40.434-0.476 69.348 37.308 78.471 52.75 45.938 77.749 119.876 55.627 148.999 42.5 4.654-32.999 17.902-55.627 32.501-68.373-113.657-12.939-233.22-56.875-233.22-253.063 0-55.94 19.968-101.561 52.658-137.404-5.22-12.999-22.844-65.095 5.063-135.563 0 0 42.937-13.749 140.811 52.501 40.811-11.406 84.594-17.031 128.124-17.22 43.499 0.188 87.314 5.874 128.188 17.28 97.689-66.311 140.686-52.501 140.686-52.501 28 70.532 10.375 122.564 5.124 135.499 32.811 35.844 52.626 81.468 52.626 137.404 0 196.686-119.751 240-233.813 252.686 18.439 15.876 34.748 47.001 34.748 94.748 0 68.437-0.686 123.627-0.686 140.501 0 13.625 9.312 29.561 35.25 24.562C877.436 929.998 1024 738.126 1024 512 1024 229.25199999999995 794.748 0 512 0z" />
								</svg>
								<span className="gh-button__title__text">Stars</span>
							</span>
							<span className="gh-button__stat">
								<svg
									className="gh-button__icon gh-button__icon--star"
									viewbox="0 0 896 1024"
								>
									<path d="M896 384l-313.5-40.781L448 64 313.469 343.219 0 384l230.469 208.875L171 895.938l277-148.812 277.062 148.812L665.5 592.875 896 384z" />
								</svg>
								<span className="gh-button__stat__text">3,944</span>
							</span>
						</a>
					</div>
					<a
						className="bottom"
						onClick={e => {
							e.preventDefault();
							window.ipcRenderer.send(
								'open-external-window',
								'https://github.com/GetStream/Winds',
							);
						}}
					>
						<span>View on GitHub</span>
						<Img src={forwardIcon} />
					</a>
				</div>
			);
		} else {
			githubPopover = (
				<div className="popover-panel github-popover">
					<div className="top" href="https://github.com/GetStream/Winds">
						<Img src={githubIcon} />
						<a
							className="gh-button"
							href="https://github.com/GetStream/Winds"
						>
							<span className="gh-button__title">
								<svg
									className="gh-button__icon gh-button__icon--github-logo"
									viewbox="0 0 1024 1024"
								>
									<path d="M512 0C229.252 0 0 229.25199999999995 0 512c0 226.251 146.688 418.126 350.155 485.813 25.593 4.686 34.937-11.125 34.937-24.626 0-12.188-0.469-52.562-0.718-95.314-128.708 23.46-161.707-31.541-172.469-60.373-5.525-14.809-30.407-60.249-52.398-72.263-17.988-9.828-43.26-33.237-0.917-33.735 40.434-0.476 69.348 37.308 78.471 52.75 45.938 77.749 119.876 55.627 148.999 42.5 4.654-32.999 17.902-55.627 32.501-68.373-113.657-12.939-233.22-56.875-233.22-253.063 0-55.94 19.968-101.561 52.658-137.404-5.22-12.999-22.844-65.095 5.063-135.563 0 0 42.937-13.749 140.811 52.501 40.811-11.406 84.594-17.031 128.124-17.22 43.499 0.188 87.314 5.874 128.188 17.28 97.689-66.311 140.686-52.501 140.686-52.501 28 70.532 10.375 122.564 5.124 135.499 32.811 35.844 52.626 81.468 52.626 137.404 0 196.686-119.751 240-233.813 252.686 18.439 15.876 34.748 47.001 34.748 94.748 0 68.437-0.686 123.627-0.686 140.501 0 13.625 9.312 29.561 35.25 24.562C877.436 929.998 1024 738.126 1024 512 1024 229.25199999999995 794.748 0 512 0z" />
								</svg>
								<span className="gh-button__title__text">Stars</span>
							</span>
							<span className="gh-button__stat">
								<svg
									className="gh-button__icon gh-button__icon--star"
									viewbox="0 0 896 1024"
								>
									<path d="M896 384l-313.5-40.781L448 64 313.469 343.219 0 384l230.469 208.875L171 895.938l277-148.812 277.062 148.812L665.5 592.875 896 384z" />
								</svg>
								<span className="gh-button__stat__text">3,944</span>
							</span>
						</a>
					</div>
					<a className="bottom" href="https://github.com/GetStream/Winds">
						<span>View on GitHub</span>
						<Img src={forwardIcon} />
					</a>
				</div>
			);
		}

		let header = (
			<header className={'header'}>
				<div className="title">
					<a href="https://getstream.io/?utm_source=Winds&utm_medium=Winds&utm_content=winds_homepage">
						Winds 2.0 – Powered by GetStream.io
					</a>
				</div>
				<div className="header-content">
					<div className="left">
						<div className="nav">
							<div className="back" onClick={this.props.history.goBack}>
								<Img decode src={backIcon} />
							</div>
							<div
								className="forward"
								onClick={this.props.history.goForward}
							>
								<Img decode={true} src={forwardIcon} />
							</div>
						</div>
						<div className="logo">
							<Link to="/">
								<Img decode={true} src={homeIcon} />
							</Link>
						</div>
						<div className="nav">
							<div
								className="refresh"
								onClick={() => {
									window.location.reload();
								}}
							>
								<Img decode={true} src={refreshIcon} />
							</div>
						</div>
					</div>
					<div className="middle">
						<SearchBar />
					</div>
					<div className="right">
						<Popover
							body={profilePopover}
							isOpen={this.state.profilePopoverIsOpen}
							onOuterAction={this.toggleProfilePopover}
							preferPlace="below"
							tipSize={0.1}
						>
							<div onClick={this.toggleProfilePopover}>
								<Avatar>{this.props.user.email}</Avatar>
							</div>
						</Popover>
						<Popover
							body={newContentPopover}
							isOpen={this.state.newContentPopoverIsOpen}
							onOuterAction={this.toggleNewContentPopover}
							preferPlace="below"
							tipSize={0.1}
						>
							<div className="new" onClick={this.toggleNewContentPopover}>
								<Img decode={true} src={addIcon} />
								New
							</div>
						</Popover>
						<Popover
							body={githubPopover}
							isOpen={this.state.githubPopoverIsOpen}
							onOuterAction={this.toggleGithubPopover}
							preferPlace="below"
							tipSize={0.1}
						>
							<div onClick={this.toggleGithubPopover}>
								<Img
									className="open-source"
									decode={true}
									src={octocatDarkIcon}
								/>
							</div>
						</Popover>
					</div>
				</div>
				<AddRSSModal
					done={this.toggleNewRSSModal}
					isOpen={this.state.newRSSModalIsOpen}
					toggleModal={this.toggleNewRSSModal}
				/>
				<AddPodcastModal
					done={this.toggleNewPodcastModal}
					isOpen={this.state.newPodcastModalIsOpen}
					toggleModal={this.toggleNewPodcastModal}
				/>
				<UserProfileSettingsDrawer
					closeDrawer={this.closeDrawer}
					isOpen={this.state.editProfileDrawerIsOpen}
				/>
			</header>
		);

		if (
			location.pathname !== '/onboarding' &&
			location.pathname !== '/onboarding/2'
		) {
			return header;
		} else {
			return false;
		}
	}
}

Header.defaultProps = {
	showIntroBanner: true,
};

Header.propTypes = {
	history: PropTypes.shape({
		goBack: PropTypes.func.isRequired,
		goForward: PropTypes.func.isRequired,
	}),
	location: PropTypes.shape({ pathname: PropTypes.string.isRequired }).isRequired,
	showIntroBanner: PropTypes.bool,
	user: PropTypes.shape({
		admin: PropTypes.bool,
		email: PropTypes.string,
		name: PropTypes.string,
		username: PropTypes.string,
	}),
};

const mapStateToProps = state => {
	return {
		showIntroBanner: state.showIntroBanner,
		user: state.users[localStorage['authedUser']],
	};
};

export default connect(mapStateToProps)(withRouter(Header));
