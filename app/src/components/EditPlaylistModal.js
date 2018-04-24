import Img from 'react-image';
import PropTypes from 'prop-types';
import React from 'react';
import ReactModal from 'react-modal';
import { connect } from 'react-redux';
import fetch from '../util/fetch';
import { withRouter } from 'react-router-dom';
import saveIcon from '../images/icons/save-without-bg.svg';

class EditPlaylistModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			deleteArmed: false,
			playlistName: props.playlistName,
			public: props.playlistPublic,
		};
		this.handleFormSubmit = this.handleFormSubmit.bind(this);
		this.armDelete = this.armDelete.bind(this);
		this.disarmDelete = this.disarmDelete.bind(this);
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
		fetch('PUT', `/playlists/${this.props.playlistID}`, {
			name: this.state.playlistName.trim(),
		})
			.then(response => {
				this.setState({
					processing: false,
				});
				// dispatch event to update playlist
				this.props.updatePlaylist(response.data);
				// navigate to new playlist
				this.props.closeModal();
			})
			.catch(err => {
				console.log(err); // eslint-disable-line no-console
				this.setState({
					processing: false,
				});
			});
	}
	armDelete() {
		this.setState({
			deleteArmed: true,
		});
	}
	disarmDelete() {
		this.setState({
			deleteArmed: false,
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
					<h1>Edit Playlist</h1>
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
					<div className="button-combo">
						<button
							className={`btn link ${
								this.state.deleteArmed ? 'cancel' : 'delete'
							}`}
							onClick={this.armDelete}
						>
							{this.state.deleteArmed ? 'Delete?' : 'Delete'}
						</button>
						{this.state.deleteArmed ? (
							<div className="button-combo">
								<button
									className="btn link delete"
									onClick={() => {
										this.props.deletePlaylist(this.props.playlistID);
									}}
								>
									Yes
								</button>
								<button
									className="btn link cancel"
									onClick={this.disarmDelete}
								>
									No
								</button>
							</div>
						) : null}
					</div>
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
							<Img src={saveIcon} />
							<span>{this.state.processing ? 'Creating....' : 'Save'}</span>
						</button>
					</div>
				</footer>
			</ReactModal>
		);
	}
}

EditPlaylistModal.defaultProps = {
	isOpen: false,
	playlistName: '',
	playlistPublic: false,
};
EditPlaylistModal.propTypes = {
	closeModal: PropTypes.func.isRequired,
	deletePlaylist: PropTypes.func,
	isOpen: PropTypes.bool,
	playlistID: PropTypes.string.isRequired,
	playlistName: PropTypes.string,
	playlistPublic: PropTypes.bool,
	updatePlaylist: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch, ownProps) => {
	return {
		...ownProps,
		deletePlaylist: playlistID => {
			fetch('DELETE', `/playlists/${playlistID}`)
				.then(() => {
					dispatch({
						playlistID,
						type: 'DELETE_PLAYLIST',
					});
					ownProps.history.push('/');
				})
				.catch(err => {
					console.log(err); // eslint-disable-line no-console
				});
		},
		updatePlaylist: playlist => {
			dispatch({
				playlist,
				type: 'UPDATE_PLAYLIST',
			});
		},
	};
};

export default withRouter(connect(null, mapDispatchToProps)(EditPlaylistModal));
