import React from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';

import { deleteTag } from '../../api/tagAPI';

class DeleteModal extends React.Component {
	constructor(props) {
		super(props);

		this.resetState = {
			error: false,
			submitting: false,
			success: false,
		};

		this.state = { ...this.resetState };
	}

	closeModal = () => {
		this.setState({ ...this.resetState });
		this.props.toggleModal();
	};

	handleSubmit = () => {
		this.setState({ submitting: true });
		deleteTag(
			this.props.dispatch,
			this.props.tagId,
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
					<h1>Delete Tag</h1>
				</header>

				<p>Are you sure you want to delete this tag?</p>

				<label />

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
	tagId: PropTypes.string,
	dispatch: PropTypes.func.isRequired,
	onDelete: PropTypes.func.isRequired,
};

export default DeleteModal;
