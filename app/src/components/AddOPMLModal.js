import { connect } from 'react-redux';
import exitIcon from '../images/buttons/exit.svg';
import Dropzone from 'react-dropzone';
import config from '../config';
import React from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import Img from 'react-image';
import axios from 'axios';
import saveIcon from '../images/icons/save.svg';
import { withRouter } from 'react-router-dom';

class AddOPMLModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			checkedFeedsToFollow: [],
			errorMessage: '',
			errored: false,
			feedsToFollow: [],
			rssInputValue: '',
			stage: 'submit-rss-url',
			submitting: false,
			success: false,
		};

		this.resetModal = this.resetModal.bind(this);
		this.sendOMPLFileToAPI = this.sendOMPLFileToAPI.bind(this);
		this.handleStageOneFormSubmit = this.handleStageOneFormSubmit.bind(this);
		this.stageOneFormIsValid = this.stageOneFormIsValid.bind(this);
	}

	sendOMPLFileToAPI() {
		this.setState({
			errorMessage: '',
			errored: false,
			submitting: true,
			success: false,
		});

		let fd = new FormData();

		fd.append('opml', this.state.file);

		axios({
			baseURL: config.api.url,
			data: fd,
			headers: {
				'Authorization': `Bearer ${localStorage['jwt']}`,
				'Content-Type': 'multipart/form-data',
			},
			method: 'POST',
			url: '/opml/upload',
		})
			.then(() => {
				this.setState({
					submitting: false,
					success: true,
				});

				if (this.props.done) {
					setTimeout(() => {
						this.props.done();
					}, 5000);
				}
			})
			.catch((err) => {
				this.setState({
					errorMessage: err.message,
					errored: true,
					submitting: false,
				});
			});
	}

	resetModal() {
		this.setState({
			checkedFeedsToFollow: [],
			errorMessage: '',
			errored: false,
			feedsToFollow: [],
			rssInputValue: '',
			stage: 'submit-rss-url',
			submitting: false,
			success: false,
		});
	}

	stageOneFormIsValid() {
		if (this.state.file) {
			return true;
		} else {
			return false;
		}
	}

	handleStageOneFormSubmit(e) {
		e.preventDefault();
		this.sendOMPLFileToAPI();
	}

	render() {
		let dropzoneContents;

		if (this.state.file) {
			dropzoneContents = <div>{this.state.file.name}</div>;
		} else {
			dropzoneContents = (
				<div className="dropzone-container">
					<button className="btn secondary" type="button">
						Select File
					</button>
					<span>or drag your file here</span>
				</div>
			);
		}

		/*eslint-disable */
		let buttonText;
		if (this.state.submitting) {
			buttonText = 'Submitting...';
		} else if (this.state.success) {
			buttonText = 'Success!';
		} else {
			buttonText = 'Submit';
		}
		/*eslint-enable */

		let currentView = (
			<form onSubmit={this.handleStageOneFormSubmit}>
				<div className="expander-section">
					<div className="expander-content">
						<div className="input-box">
							<Dropzone
								className="dropzone"
								onDrop={(acceptedFiles) => {
									this.setState({
										file: acceptedFiles[0],
									});
								}}
							>
								{dropzoneContents}
							</Dropzone>
						</div>
						<div className="info">
							Upload a valid RSS OPML file and we will add it to Winds.
						</div>
						<div className="error-message">{this.state.errorMessage}</div>
					</div>
				</div>
				<div className="buttons">
					{this.state.opmlSectionExpanded ? (
						<button
							className="btn primary alt with-circular-icon"
							disabled={
								this.state.submitting ||
								this.state.success ||
								!this.stageOneFormIsValid()
							}
							type="submit"
						>
							<Img src={saveIcon} />
							<span className="button-text">Import OPML</span>
						</button>
					) : (
						<button
							className="btn primary alt with-circular-icon"
							disabled={
								this.state.submitting ||
								this.state.success ||
								!this.stageOneFormIsValid()
							}
							type="submit"
						>
							<Img src={saveIcon} />
							<span className="button-text">Add RSS</span>
						</button>
					)}
					<button
						className="btn link cancel"
						onClick={(e) => {
							e.preventDefault();
							this.resetModal();
							this.props.done();
						}}
						type="cancel"
					>
						Cancel
					</button>
				</div>
			</form>
		);

		return (
			<ReactModal
				className="modal add-new-content-modal"
				isOpen={this.props.isOpen}
				onRequestClose={() => {
					this.resetModal();
					this.props.toggleModal();
				}}
				overlayClassName="modal-overlay"
				shouldCloseOnOverlayClick={true}
			>
				<header>
					<h1>Add OPML File</h1>
					<Img
						className="exit"
						onClick={this.props.toggleModal}
						src={exitIcon}
					/>
				</header>
				{currentView}
			</ReactModal>
		);
	}
}

AddOPMLModal.defaultProps = {
	isOpen: false,
};

AddOPMLModal.propTypes = {
	dispatch: PropTypes.func.isRequired,
	done: PropTypes.func.isRequired,
	history: PropTypes.shape({ push: PropTypes.func.isRequired }).isRequired,
	isOpen: PropTypes.bool,
	toggleModal: PropTypes.func.isRequired,
};

export default connect()(withRouter(AddOPMLModal));
