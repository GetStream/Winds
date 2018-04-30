import doubleArrowWhiteIcon from '../images/icons/double-arrow-white.svg';
import defaultWhiteIcon from '../images/loaders/default-white.svg';
import { Link, withRouter } from 'react-router-dom';
import Dropzone from 'react-dropzone';
import Img from 'react-image';
import PropTypes from 'prop-types';
import React from 'react';
import axios from 'axios';
import config from '../config';
import { connect } from 'react-redux';

class OnboardingOPMLView extends React.Component {
	constructor(props) {
		super(props);

		this.state = { submitting: false };
		this.sendOMPLFileToAPI = this.sendOMPLFileToAPI.bind(this);
	}

	sendOMPLFileToAPI(e) {
		e.preventDefault();
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

				setTimeout(() => {
					this.props.history.push('/');
				}, 2000);
			})
			.catch(err => {
				this.setState({
					errorMessage: err.message,
					errored: true,
					submitting: false,
				});
			});
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

		let buttonText = 'Continue';
		let buttonIcon = doubleArrowWhiteIcon;
		if (this.state.submitting) {
			buttonText = 'Submitting...';
			buttonIcon = defaultWhiteIcon;
		} else if (this.state.submitting === false && this.state.success) {
			buttonText = 'Success!';
		}

		return (
			<div className="onboarding-2-view">
				<form onSubmit={this.sendOMPLFileToAPI}>
					<h1>Import Your Own OPML</h1>
					<p>Get started faster with your own RSS subscriptions</p>
					<button
						className="btn primary with-icon"
						disabled={
							!this.state.file ||
							this.state.submitting ||
							this.state.success
						}
						type="submit"
					>
						<Img height="12" src={buttonIcon} width="18" />
						<span>{buttonText}</span>
					</button>
					<Link className="btn link" to="/">
						Skip
					</Link>
					<div className="input-box">
						<Dropzone
							accept=".opml"
							className="dropzone"
							onDrop={acceptedFiles => {
								this.setState({
									file: acceptedFiles[0],
								});
							}}
						>
							{dropzoneContents}
						</Dropzone>
					</div>
					<span className="error-message">{this.state.errorMessage}</span>
				</form>
			</div>
		);
	}
}

OnboardingOPMLView.propTypes = {
	history: PropTypes.shape({
		push: PropTypes.func.isRequired,
	}).isRequired,
};

const mapStateToProps = (state, ownProps) => {
	return { ...ownProps };
};

const mapDispatchToProps = (dispatch, ownProps) => {
	return { ...ownProps };
};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
	return {
		...ownProps,
		...dispatchProps,
		...stateProps,
	};
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(
	withRouter(OnboardingOPMLView),
);
