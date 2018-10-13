import React from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import Img from 'react-image';

import { deleteFolder } from '../../api/folderAPI';
import exitIcon from '../../images/buttons/exit.svg';

class DeleteModal extends React.Component {
	constructor(props) {
		super(props);

		this.resetState = {
			error: false,
			submitting: false,
			success: false,
			unfollow: false,
		};

		this.state = {
			...this.resetState,
		};
	}

	closeModal = () => {
		this.setState({ ...this.resetState });
		this.props.toggleModal();
	};

	handleSubmit = () => {
		this.setState({ submitting: true });
		deleteFolder(
			this.props.dispatch,
			this.props.folderId,
			this.state.unfollow,
			() => {
				this.setState({ success: true, submitting: false });
				setTimeout(() => {
					this.props.onDelete();
					this.closeModal();
				}, 500);
			},
			() => this.setState({ error: true, submitting: false }),
		);
	};

	render() {
		let buttonText = 'DELETE';
		if (this.state.submitting) buttonText = 'Deleting...';
		else if (this.state.success) buttonText = 'Deleted!';

		return (
			<ReactModal
				className="modal add-new-content-modal"
				isOpen={this.props.isOpen}
				onRequestClose={() => this.closeModal()}
				overlayClassName="modal-overlay"
				shouldCloseOnOverlayClick={true}
			>
				<header>
					<h1>Delete Folder</h1>
					<Img
						className="exit"
						onClick={() => this.closeModal()}
						src={exitIcon}
					/>
				</header>

				<p>Are you sure you want to delete this folder?</p>

				<label>
					<input
						checked={this.state.unfollow}
						onChange={() => this.setState({ unfollow: !this.state.unfollow })}
						type="checkbox"
					/>
					Unfollow all feeds in folder
				</label>

				{this.state.error && (
					<div className="error-message">
						Oops, something went wrong. Please try again later.
					</div>
				)}
				<div className="buttons">
					<button
						className="btn alert"
						disabled={this.state.submitting}
						onClick={this.handleSubmit}
					>
						{buttonText}
					</button>

					<button className="btn link cancel" onClick={() => this.closeModal()}>
						Cancel
					</button>
				</div>
			</ReactModal>
		);
	}
}

DeleteModal.defaultProps = {
	isOpen: false,
};

DeleteModal.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	toggleModal: PropTypes.func.isRequired,
	folderId: PropTypes.string,
	dispatch: PropTypes.func.isRequired,
	onDelete: PropTypes.func.isRequired,
};

export default DeleteModal;
