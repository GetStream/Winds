import React from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import { Img } from 'react-image';

import { renameTag } from '../../api/tagAPI';
import saveIcon from '../../images/icons/save.svg';
import exitIcon from '../../images/buttons/exit.svg';

class RenameModal extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			error: false,
			submitting: false,
			success: false,
		};
	}

	closeModal = () => {
		this.setState({ error: false, submitting: false, success: false });
		this.props.toggleModal();
	};

	handleSubmit = (e) => {
		e.preventDefault();
		const name = new FormData(e.target).get('name');
		this.setState({ submitting: true });
		renameTag(
			this.props.dispatch,
			this.props.tagId,
			name,
			(res) => {
				if (res.data) {
					this.setState({ success: true, submitting: false });
					setTimeout(() => this.closeModal(), 500);
				}
			},
			() => this.setState({ error: true, submitting: false }),
		);
	};

	render() {
		let buttonText = 'SAVE';
		if (this.state.submitting) buttonText = 'Submitting...';
		else if (this.state.success) buttonText = 'Success!';

		return (
			<ReactModal
				className="modal add-new-content-modal"
				isOpen={this.props.isOpen}
				onRequestClose={() => this.closeModal()}
				overlayClassName="modal-overlay"
				shouldCloseOnOverlayClick={true}
			>
				<header>
					<h1>Rename Tag</h1>
					<Img
						className="exit"
						onClick={() => this.closeModal()}
						src={exitIcon}
					/>
				</header>

				<form onSubmit={this.handleSubmit}>
					<div className="input-box">
						<input
							autoComplete="false"
							defaultValue={this.props.defVal}
							name="name"
							placeholder="Enter new name"
							type="text"
						/>
					</div>

					{this.state.error && (
						<div className="error-message">
							Oops, something went wrong. Please try again later.
						</div>
					)}

					<div className="buttons">
						<button
							className="btn primary alt with-circular-icon"
							disabled={this.state.submitting}
							type="submit"
						>
							<Img src={saveIcon} />
							{buttonText}
						</button>

						<button
							className="btn link cancel"
							onClick={(e) => {
								e.preventDefault();
								this.closeModal();
							}}
							type="cancel"
						>
							Cancel
						</button>
					</div>
				</form>
			</ReactModal>
		);
	}
}

RenameModal.defaultProps = {
	isOpen: false,
};

RenameModal.propTypes = {
	isOpen: PropTypes.bool,
	toggleModal: PropTypes.func.isRequired,
	defVal: PropTypes.string,
	tagId: PropTypes.string,
	dispatch: PropTypes.func.isRequired,
};

export default RenameModal;
