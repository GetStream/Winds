import { connect } from 'react-redux';
import exitIcon from '../images/buttons/exit.svg';
import Dropzone from 'react-dropzone';
import config from '../config';
import React from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import Img from 'react-image';
import axios from 'axios';
import fetch from '../util/fetch';
import saveIcon from '../images/icons/save.svg';
import rssIcon from '../images/icons/rss.svg';
import { withRouter } from 'react-router-dom';

class AddRSSModal extends React.Component {
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

		this.submitRSSFeedURL = this.submitRSSFeedURL.bind(this);
		this.submitFeedSelections = this.submitFeedSelections.bind(this);
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
			.catch(err => {
				this.setState({
					errorMessage: err.message,
					errored: true,
					submitting: false,
				});
			});
	}

	handleStageOneFormSubmit(e) {
		e.preventDefault();
		if (this.state.opmlSectionExpanded) {
			this.sendOMPLFileToAPI();
		} else {
			this.submitRSSFeedURL();
		}
	}

	submitRSSFeedURL() {
		this.setState({
			errorMessage: '',
			errored: false,
			submitting: true,
			success: false,
		});
		axios({
			baseURL: config.api.url,
			data: { feedUrl: this.state.rssInputValue },
			headers: {
				'Authorization': `Bearer ${localStorage['jwt']}`,
				'Content-Type': 'application/json',
			},
			method: 'POST',
			url: '/rss',
		})
			.then(res => {
				for (let rssFeed of res.data) {
					this.props.dispatch({
						rssFeed,
						type: 'UPDATE_RSS_FEED',
					});
				}
				this.setState({
					feedsToFollow: res.data,
					stage: 'select-feeds',
					submitting: false,
				});
			})
			.catch(err => {
				this.setState({
					errorMessage:
						err.response.status === 400 || err.response.status === 500
							? 'Please enter a valid RSS URL.'
							: 'Oops, something went wrong. Please try again later.',
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

	submitFeedSelections(e) {
		e.preventDefault();
		this.setState({
			errorMessage: '',
			errored: false,
			submitting: true,
			success: false,
		});
		Promise.all(
			this.state.checkedFeedsToFollow.map(checkedFeedToFollow => {
				return fetch('post', '/follows', null, {
					rss: checkedFeedToFollow,
					type: 'rss',
				}).then(response => {
					this.props.dispatch({
						rssFeedID: response.data.rss,
						type: 'FOLLOW_RSS_FEED',
						userID: response.data.user,
					});
					return response.data.rss;
				});
			}),
		)
			.then(rssFeeds => {
				this.setState({
					submitting: false,
					success: true,
				});
				this.props.history.push(`/rss/${rssFeeds[0]}`);
				setTimeout(() => {
					this.resetModal();
					this.props.done();
				}, 5000);
			})
			.catch(err => {
				this.setState({
					errorMessage: err.message,
					submitting: false,
					success: false,
				});
			});
	}

	stageOneFormIsValid() {
		if (this.state.opmlSectionExpanded && this.state.file) {
			return true;
		} else if (
			!this.state.opmlSectionExpanded &&
			this.state.rssInputValue.trim() !== ''
		) {
			return true;
		} else {
			return false;
		}
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

		let currentView = null;
		if (this.state.stage === 'submit-rss-url') {
			currentView = (
				<form onSubmit={this.handleStageOneFormSubmit}>
					<div className="input-box">
						<input
							autoComplete="false"
							disabled={this.state.opmlSectionExpanded}
							onChange={e => {
								this.setState({
									rssInputValue: e.target.value,
								});
							}}
							placeholder="Enter URL"
							type="text"
							value={this.state.rssInputValue}
						/>
						<Img src={rssIcon} />
					</div>
					<div className="info">
						Enter a valid RSS feed url and we will add it to Winds.
					</div>
					<div className="error-message">{this.state.errorMessage}</div>
					<div className="expander-section">
						<div
							className="expander-button"
							onClick={() => {
								this.setState({
									opmlSectionExpanded: !this.state.opmlSectionExpanded,
								});
							}}
						>
							<span>Import OPML</span>
							<i
								className={`fas fa-chevron-${
									this.state.opmlSectionExpanded ? 'up' : 'down'
								}`}
							/>
							<div className="expander-bar" />
						</div>
						{this.state.opmlSectionExpanded ? (
							<div className="expander-content">
								<div className="input-box">
									<Dropzone
										accept="application/xml, text/xml, text/x-opml"
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
								<div className="info">
									Upload a valid RSS OPML file and we will add it to
									Winds.
								</div>
								<div className="error-message">
									{this.state.errorMessage}
								</div>
							</div>
						) : null}
					</div>
					<div className="buttons">
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
							<span className="button-text">Go</span>
						</button>
						<button
							className="btn link cancel"
							onClick={e => {
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
		} else if (this.state.stage === 'select-feeds') {
			currentView = (
				<form onSubmit={this.submitFeedSelections}>
					<div className="input-box">
						<input
							disabled={true}
							type="text"
							value={this.state.rssInputValue}
						/>
						<Img src={rssIcon} />
					</div>
					<div className="info">
						{
							'We found a few feeds with that URL. Once your selection has been made, we will begin to process the feeds. They will be ready shortly after.'
						}
					</div>
					{this.state.feedsToFollow.map(feedToFollow => {
						return (
							<div key={feedToFollow._id}>
								<label>
									<input
										checked={this.state.checkedFeedsToFollow.includes(
											feedToFollow._id,
										)}
										onChange={() => {
											// if feeds to follow already includes feed id, remove feed id
											let newFeedsToFollow = [
												...this.state.checkedFeedsToFollow,
											];
											let index = newFeedsToFollow.findIndex(
												element => {
													return element === feedToFollow._id;
												},
											);
											if (index === -1) {
												// add to feedsToFollow
												newFeedsToFollow.push(feedToFollow._id);
											} else {
												// splice out index
												newFeedsToFollow.splice(index, 1);
											}
											this.setState({
												checkedFeedsToFollow: newFeedsToFollow,
											});
										}}
										type="checkbox"
									/>
									<span>{feedToFollow.title}</span>
								</label>
							</div>
						);
					})}
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
							onClick={e => {
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
		}

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
					<h1>Add New RSS Feed</h1>
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

AddRSSModal.defaultProps = {
	isOpen: false,
};

AddRSSModal.propTypes = {
	dispatch: PropTypes.func.isRequired,
	done: PropTypes.func.isRequired,
	history: PropTypes.shape({ push: PropTypes.func.isRequired }).isRequired,
	isOpen: PropTypes.bool,
	toggleModal: PropTypes.func.isRequired,
};

export default connect()(withRouter(AddRSSModal));
