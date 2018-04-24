import saveWithoutBackgroundIcon from '../images/icons/save-without-bg.svg';
import Img from 'react-image';
import PropTypes from 'prop-types';
import React from 'react';
import ReactModal from 'react-modal';
import { connect } from 'react-redux';
import fetch from '../util/fetch';
import { withRouter } from 'react-router-dom';

ReactModal.setAppElement('#root');

class NewPlaylistModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			playlistName: '',
			processing: false,
			public: false,
		};
		this.handleFormSubmit = this.handleFormSubmit.bind(this);
	}
	playlistNameIsValid() {
		return this.state.playlistName.trim().length >= 2;
	}
	handleFormSubmit(e) {
		e.preventDefault();
		if (!this.playlistNameIsValid()) {
			return;
		}
		this.setState({
			processing: true,
		});
		// fire off api call, adjust state
		fetch('POST', '/playlists', { name: this.state.playlistName.trim() })
			.then(response => {
				this.setState({
					processing: false,
				});
				// dispatch event to update playlist
				this.props.updatePlaylist(response.data);
				// navigate to new playlist
				this.props.history.push(`/playlists/${response.data._id}`);
			})
			.catch(err => {
				console.log(err); // eslint-disable-line no-console
				this.setState({
					processing: false,
				});
			});
	}
	render() {
		return (
			<ReactModal
				className="modal"
				isOpen={this.props.isOpen}
				onRequestClose={this.props.closeModal}
				overlayClassName="modal-overlay"
				shouldCloseOnEsc={true}
				shouldCloseOnOverlayClick={true}
			>
				<header>
					<h1>Create Playlist</h1>
					<Img
						className="exit"
						onClick={this.props.closeModal}
						src="/images/buttons/exit.svg"
					/>
				</header>
				<form id="new-playlist-form" onSubmit={this.handleFormSubmit}>
					<input
						onChange={e => {
							this.setState({
								playlistName: e.target.value,
							});
						}}
						placeholder="Playlist name"
						type="text"
						value={this.state.playlistName}
					/>
					<div className="radio-buttons">
						<label>
							<input
								checked={!this.state.public}
								onChange={() => {
									this.setState({
										public: false,
									});
								}}
								type="radio"
							/>
							<span>Private</span>
						</label>
						<label>
							<input
								checked={this.state.public}
								onChange={() => {
									this.setState({
										public: true,
									});
								}}
								type="radio"
							/>
							<span>Public</span>
						</label>
					</div>
				</form>
				<footer>
					<div className="button-combo right">
						<button
							className="btn link cancel"
							onClick={this.props.closeModal}
						>
							Cancel
						</button>
						<button
							className="btn primary with-circular-icon"
							disabled={
								!this.playlistNameIsValid() || this.state.processing
							}
							form="new-playlist-form"
							type="submit"
						>
							<Img src={saveWithoutBackgroundIcon} />
							<span>{this.state.processing ? 'Creating....' : 'Save'}</span>
						</button>
					</div>
				</footer>
			</ReactModal>
		);
	}
}

NewPlaylistModal.defaultProps = { isOpen: false };
NewPlaylistModal.propTypes = {
	closeModal: PropTypes.func.isRequired,
	history: PropTypes.shape({
		push: PropTypes.func.isRequired,
	}).isRequired,
	isOpen: PropTypes.bool,
	updatePlaylist: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch, ownProps) => {
	return {
		...ownProps,
		updatePlaylist: playlist => {
			dispatch({
				playlist,
				type: 'UPDATE_PLAYLIST',
			});
		},
	};
};

export default connect(null, mapDispatchToProps)(withRouter(NewPlaylistModal));
