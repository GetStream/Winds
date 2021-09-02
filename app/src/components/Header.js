import config from '../config';
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
import { Img } from 'react-image';
import PropTypes from 'prop-types';
import SearchBar from './SearchBar';
import { connect } from 'react-redux';
import Popover from 'react-popover';
import AddRSSModal from './AddRSSModal';
import AddPodcastModal from './AddPodcastModal';
import AddOPMLModal from './AddOPMLModal';

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
	}

	toggleGithubPopover = (e) => {
		e.preventDefault();
		this.setState((prevState) => ({
			githubPopoverIsOpen: !prevState.githubPopoverIsOpen,
		}));
	};

	toggleNewContentPopover = (e) => {
		e.preventDefault();
		this.setState((prevState) => ({
			newContentPopoverIsOpen: !prevState.newContentPopoverIsOpen,
		}));
	};

	toggleNewRSSModal = () => {
		this.setState((prevState) => ({
			newContentPopoverIsOpen: false,
			newRSSModalIsOpen: !prevState.newRSSModalIsOpen,
		}));
	};

	toggleNewPodcastModal = () => {
		this.setState((prevState) => ({
			newContentPopoverIsOpen: false,
			newPodcastModalIsOpen: !prevState.newPodcastModalIsOpen,
		}));
	};

	toggleOPMLModal = () => {
		this.setState((prevState) => ({
			newContentPopoverIsOpen: false,
			addOPMLModalIsOpen: !prevState.addOPMLModalIsOpen,
		}));
	};

	toggleProfilePopover = () => {
		this.setState((prevState) => ({
			profilePopoverIsOpen: !prevState.profilePopoverIsOpen,
		}));
	};

	closeProfilePopover = () => {
		this.setState({ profilePopoverIsOpen: false });
	};

	closeDrawer = () => {
		this.setState({ editProfileDrawerIsOpen: false });
	};

	openDrawer = () => {
		this.setState({ editProfileDrawerIsOpen: true });
	};

	render() {
		const profilePopover = (
			<div className="popover-panel profile-popover">
				<div className="panel-element user">
					<div className="avatar">
						<a href="https://gravatar.com">
							<Avatar
								gravatarURL={this.props.user.gravatar}
								height={80}
								userID={this.props.user._id}
								width={80}
							/>
						</a>
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
				{this.props.user.admin && (
					<Link className="panel-element" to="/admin">
						admin section
					</Link>
				)}
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

		const newContentPopover = (
			<div className="popover-panel new-content-popover">
				<div className="panel-element" onClick={this.toggleNewPodcastModal}>
					<i className="fas fa-podcast" />
					<span>New Podcast</span>
				</div>
				<div className="panel-element" onClick={this.toggleNewRSSModal}>
					<i className="fas fa-rss" />
					<span>New RSS</span>
				</div>
				<div className="panel-element" onClick={this.toggleOPMLModal}>
					<i className="far fa-file-alt" />
					<span>Add OMPL</span>
				</div>
			</div>
		);

		const githubPopover = (
			<div className="popover-panel github-popover">
				<div className="top">
					<Img src={githubIcon} />
					<a className="gh-button" href="https://github.com/GetStream/Winds">
						<span className="gh-button__title">
							<span className="gh-button__title__text">Stars</span>
						</span>
						<span className="gh-button__stat">
							<span className="gh-button__stat__text">5,705</span>
						</span>
					</a>
				</div>
				<a className="bottom" href="https://github.com/GetStream/Winds">
					<span>View on GitHub</span>
					<Img src={forwardIcon} />
				</a>
			</div>
		);

		return (
			<header className="header">
				<div className="title">
					<a href="https://getstream.io/?utm_source=Winds&utm_medium=Winds&utm_content=winds_homepage">
						Winds {config.version} – Powered by GetStream.io
					</a>
				</div>
				<div className="header-content">
					<div className="left">
						<div className="nav">
							<div className="back" onClick={this.props.history.goBack}>
								<Img decode={false} src={backIcon} />
							</div>
							<div
								className="forward"
								onClick={this.props.history.goForward}
							>
								<Img decode={false} src={forwardIcon} />
							</div>
						</div>
						<div className="logo">
							<Link to="/">
								<Img decode={false} src={homeIcon} />
							</Link>
						</div>
						<div className="nav">
							<div
								className="refresh"
								onClick={() => {
									window.location.reload();
								}}
							>
								<Img decode={false} src={refreshIcon} />
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
								<Avatar
									gravatarURL={this.props.user.gravatar}
									userID={this.props.user._id}
								/>
							</div>
						</Popover>
						<Popover
							body={newContentPopover}
							isOpen={this.state.newContentPopoverIsOpen}
							onOuterAction={this.toggleNewContentPopover}
							preferPlace="below"
							tipSize={0.1}
						>
							<div
								className="btn-new"
								onClick={this.toggleNewContentPopover}
							>
								<Img decode={false} src={addIcon} />
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
									decode={false}
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
				<AddOPMLModal
					done={this.toggleOPMLModal}
					isOpen={this.state.addOPMLModalIsOpen}
					toggleModal={this.toggleOPMLModal}
				/>

				<UserProfileSettingsDrawer
					closeDrawer={this.closeDrawer}
					isOpen={this.state.editProfileDrawerIsOpen}
				/>
			</header>
		);
	}
}

Header.propTypes = {
	history: PropTypes.shape({
		goBack: PropTypes.func.isRequired,
		goForward: PropTypes.func.isRequired,
	}),
	user: PropTypes.shape({
		_id: PropTypes.string,
		admin: PropTypes.bool,
		name: PropTypes.string,
		username: PropTypes.string,
		gravatar: PropTypes.string,
	}),
};

const mapStateToProps = (state) => ({
	user: state.user,
});

export default connect(mapStateToProps)(withRouter(Header));
