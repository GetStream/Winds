import React from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';

import { upsertFolder } from '../../api/folderAPI';

class FeedToFolderModal extends React.Component {
	constructor(props) {
		super(props);

		this.resetState = {
			name: '',
			errMsg: '',
			submitting: false,
			success: false,
		};

		this.state = { ...this.resetState };
	}

	submit = (e) => {
		e.preventDefault();
		this.setState({ submitting: true, success: false, errMsg: '' });

		if (!this.state.name)
			return this.setState({
				submitting: false,
				errMsg: 'Your folder needs a name!',
			});

		upsertFolder(
			this.props.dispatch,
			this.props.currFolderID,
			this.props.isRss,
			this.props.feedID,
			this.state.name,
			({ data }) => {
				this.setState({ submitting: false, success: true });

				setTimeout(() => {
					this.closeModal();
					this.props.history.push(`/folders/${data._id}`);
				}, 1000);
			},
			(err) => {
				console.log(err); // eslint-disable-line no-console
				this.setState({
					errored: 'Oops, something went wrong. Please try again.',
					submitting: false,
				});
			},
		);
	};

	closeModal = () => {
		this.setState({ ...this.resetState });
		this.props.toggleModal();
	};

	render() {
		let buttonText = 'Save';
		if (this.state.submitting) buttonText = 'Submitting...';
		else if (this.state.success) buttonText = 'Success!';

		return (
			<ReactModal
				ariaHideApp={false}
				className="modal add-new-content-modal"
				isOpen={this.props.isOpen}
				onRequestClose={this.closeModal}
				overlayClassName="modal-overlay"
				shouldCloseOnOverlayClick={true}
			>
				<header>
					<h1>Add feed to New Folder</h1>
				</header>

				<form onSubmit={this.submit}>
					<div className="input-box">
						<input
							autoComplete="false"
							onChange={(e) =>
								this.setState({
									name: e.target.value,
									errMsg: '',
								})
							}
							placeholder="Folder name"
							type="text"
							value={this.state.name}
						/>
					</div>

					{this.state.errMsg && (
						<div className="error-message">{this.state.errMsg}</div>
					)}

					<div className="buttons">
						<button
							className="btn primary"
							disabled={this.state.submitting || this.state.success}
							type="submit"
						>
							{buttonText}
						</button>
						<button
							className="btn link cancel"
							onClick={this.closeModal}
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

FeedToFolderModal.defaultProps = {
	isOpen: false,
	currFolderID: null,
};

FeedToFolderModal.propTypes = {
	dispatch: PropTypes.func.isRequired,
	isOpen: PropTypes.bool,
	toggleModal: PropTypes.func.isRequired,
	feedID: PropTypes.string.isRequired,
	isRss: PropTypes.bool.isRequired,
	currFolderID: PropTypes.string,
	history: PropTypes.shape({ push: PropTypes.func.isRequired }).isRequired,
};

export default FeedToFolderModal;
