import Dropzone from 'react-dropzone';
import Img from 'react-image';
import PropTypes from 'prop-types';
import React from 'react';
import axios from 'axios';
import config from '../config';
import saveIcon from '../images/icons/save.svg';

class AddOPMLFile extends React.Component {
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

				if (this.props.done) {
					setTimeout(() => {
						this.props.done();
					}, 5000);
				}
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

		let buttonText;
		if (this.state.submitting) {
			buttonText = 'Submitting...';
		} else if (this.state.success) {
			buttonText = 'Success!';
		} else {
			buttonText = 'Submit';
		}

		return (
			<form onSubmit={this.sendOMPLFileToAPI}>
				<div className="input-box">
					<Dropzone
						accept=".xml"
						className="dropzone"
						multiple={false}
						onDrop={acceptedFiles => {
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

				<div className="buttons">
					<button
						className="btn primary alt with-circular-icon"
						disabled={this.state.submitting || this.state.success}
						type="submit"
					>
						<Img src={saveIcon} />

						<span className="button-text">{buttonText}</span>
					</button>
					<button
						className="btn link cancel"
						onClick={() => {
							if (this.props.done) {
								this.props.done();
							}
						}}
						type="cancel"
					>
						Cancel
					</button>
				</div>
			</form>
		);
	}
}

AddOPMLFile.propTypes = {
	done: PropTypes.func,
};

export default AddOPMLFile;
