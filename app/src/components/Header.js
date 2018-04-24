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

	render() {
		let profilePopover = (
			<div className="panel profile-popover">
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
						<Link
							className="btn primary alt"
							onClick={this.toggleProfilePopover}
							to="/profile"
						>
							View Profile
						</Link>
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
						window.location = '/';
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
			<div className="panel new-content-popover">
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
		let githubPopover = (
			<div className="popover github-popover">
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
					<iframe
						frameBorder="0"
						height="30px"
						scrolling="0"
						src="https://ghbtns.com/github-btn.html?user=GetStream&repo=Winds&type=watch&count=true&size=large"
						title="GitHub Button"
						width="170px"
					/>
				</div>
				<a
					className="bottom"
					href="https://github.com/GetStream/Winds"
					rel="noopener noreferrer"
					target="_blank"
				>
					<span>View on GitHub</span>
					<Img src={forwardIcon} />
				</a>
			</div>
		);

		return (
			<header className={'header'}>
				<div className="warning-bar">
					<p>{'Hi there! Thanks for trying out Winds!'}</p>
					<p>
						{
							'This is a beta version, so be sure to report bugs that you find over at: '
						}
					</p>
					<p>
						<a href="https://github.com/GetStream/winds/issues/new">
							{'github.com/GetStream/winds/issues/new'}
						</a>
					</p>
				</div>
				<div className="title">
					<a href="https://getstream.io/?utm_source=Winds&utm_medium=Winds&utm_content=winds_homepage">
						Winds – Powered by GetStream.io
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
			</header>
		);
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
