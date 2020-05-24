import React from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import Dropzone from 'react-dropzone';
import { Img } from 'react-image';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import fetch from '../util/fetch';

import saveIcon from '../images/icons/save.svg';
import exitIcon from '../images/buttons/exit.svg';

class AddOPMLModal extends React.Component {
	constructor(props) {
		super(props);

		this.resetState = {
			errorMessage: '',
			errored: false,
			submitting: false,
			success: false,
			file: null,
		};

		this.state = { ...this.resetState };
	}

	resetModal = () => {
		this.setState({ ...this.resetState });
	};

	handleSubmit = (e) => {
		e.preventDefault();

		this.setState({
			errorMessage: '',
			errored: false,
			submitting: true,
			success: false,
		});

		let fd = new FormData();
		fd.append('opml', this.state.file);

		fetch('POST', '/opml/upload', fd, null, { 'Content-Type': 'multipart/form-data' })
			.then(() => {
				this.setState({ submitting: false, success: true });
				setTimeout(() => {
					this.resetModal();
					this.props.done();
				}, 1500);
			})
			.catch((err) => {
				this.setState({
					errorMessage: err.message,
					errored: true,
					submitting: false,
				});
			});
	};

	render() {
		let buttonText = 'Import OPML';
		if (this.state.submitting) buttonText = 'Importing...';
		else if (this.state.success) buttonText = 'Success!';

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

				<form onSubmit={this.handleSubmit}>
					<div className="expander-section">
						<div className="expander-content">
							<div className="input-box">
								<Dropzone
									onDrop={(file) => this.setState({ file: file[0] })}
								>
									{({ getRootProps, getInputProps }) => {
										return (
											<div {...getRootProps()} className="dropzone">
												<input {...getInputProps()} />
												{this.state.file ? (
													<div>{this.state.file.name}</div>
												) : (
													<div className="dropzone-container">
														<button
															className="btn secondary"
															type="button"
														>
															Select File
														</button>
														<span>
															or drag your file here
														</span>
													</div>
												)}
											</div>
										);
									}}
								</Dropzone>
							</div>
							<div className="info">
								Upload a valid RSS OPML file and we will add it to Winds.
							</div>
							<div className="error-message">{this.state.errorMessage}</div>
						</div>
					</div>
					<div className="buttons">
						<button
							className="btn primary alt with-circular-icon"
							disabled={
								this.state.submitting ||
								this.state.success ||
								!this.state.file
							}
							type="submit"
						>
							<Img src={saveIcon} />
							<span className="button-text">{buttonText}</span>
						</button>

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
