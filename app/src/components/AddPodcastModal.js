import exitIcon from '../images/buttons/exit.svg';
import config from '../config';
import React from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import Img from 'react-image';
import axios from 'axios';
import fetch from '../util/fetch';
import saveIcon from '../images/icons/save.svg';

class AddPodcastModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			checkedPodcastsToFollow: [],
			errorMessage: '',
			errored: false,
			podcastInputValue: '',
			podcastsToFollow: [],
			stage: 'submit-podcast-url',
			submitting: false,
			success: false,
		};
		this.submitPodcastURL = this.submitPodcastURL.bind(this);
		this.resetModal = this.resetModal.bind(this);
		this.submitPodcastSelections = this.submitPodcastSelections.bind(this);
	}

	submitPodcastURL(e) {
		e.preventDefault();

		this.setState({
			errorMessage: '',
			errored: false,
			submitting: true,
			success: false,
		});

		axios({
			baseURL: config.api.url,
			data: { feedUrl: this.state.podcastInputValue },
			headers: {
				'Authorization': `Bearer ${localStorage['jwt']}`,
				'Content-Type': 'application/json',
			},
			method: 'POST',
			url: '/podcasts',
		})
			.then(response => {
				this.setState({
					podcastsToFollow: response.data,
					stage: 'select-podcasts',
					submitting: false,
				});
			})
			.catch(err => {
				this.setState({
					errorMessage: err.message,
					errored: true,
					submitting: false,
				});
			});
	}

	submitPodcastSelections(e) {
		e.preventDefault();

		this.setState({
			errorMessage: '',
			errored: false,
			submitting: true,
			success: false,
		});

		Promise.all(
			this.state.checkedPodcastsToFollow.map(checkedPodcastToFollow => {
				return fetch('post', '/follows', null, {
					podcast: checkedPodcastToFollow,
					type: 'podcast',
				});
			}),
		).then(() => {
			this.setState({
				submitting: false,
				success: true,
			});
			setTimeout(() => {
				this.resetModal();
				this.props.done();
			}, 5000);
		});
	}

	resetModal() {
		this.setState({
			checkedPodcastsToFollow: [],
			errorMessage: '',
			errored: false,
			feedsToFollow: [],
			podcastInputValue: '',
			stage: 'submit-podcast-url',
			submitting: false,
			success: false,
		});
	}

	render() {
		let buttonText;

		if (this.state.submitting) {
			buttonText = 'Submitting...';
		} else if (this.state.success) {
			buttonText = 'Success!';
		} else {
			buttonText = 'Submit';
		}

		let currentView = null;
		if (this.state.stage === 'submit-podcast-url') {
			currentView = (
				<form onSubmit={this.submitPodcastURL}>
					<div className="input-box">
						<input
							autoComplete="false"
							onChange={e => {
								this.setState({
									podcastInputValue: e.target.value,
								});
							}}
							placeholder="Enter URL"
							type="text"
							value={this.state.podcastInputValue}
						/>
					</div>
					<div className="info">
						Enter a valid podcast url and we will add it to Winds.
					</div>
					<div className="error-message">{this.state.errorMessage}</div>
					<div className="buttons">
						<button
							className="btn primary alt with-circular-icon"
							disabled={this.state.submitting || this.state.success}
							type="submit"
						>
							<Img src={saveIcon} />
							<span className="button-text">Go</span>
						</button>
						<button
							className="btn link cancel"
							onClick={() => {
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
		} else if (this.state.stage === 'select-podcasts') {
			currentView = (
				<form onSubmit={this.submitPodcastSelections}>
					<div className="input-box">
						<input
							disabled={true}
							type="text"
							value={this.state.podcastInputValue}
						/>
					</div>
					<div className="info">
						{
							'We found a few podcasts with that URL. Once your selection has been made, we will begin to process the podcasts. They will be ready shortly after.'
						}
					</div>
					{this.state.podcastsToFollow.map(podcastToFollow => {
						return (
							<div key={podcastToFollow._id}>
								<label>
									<input
										checked={this.state.checkedPodcastsToFollow.includes(
											podcastToFollow._id,
										)}
										onChange={() => {
											// if podcasts to follow already includes feedUrl, remove feedUrl
											let newPodcastsToFollow = [
												...this.state.checkedPodcastsToFollow,
											];
											let index = newPodcastsToFollow.findIndex(
												element => {
													return (
														element === podcastToFollow._id
													);
												},
											);
											if (index === -1) {
												// add to podcastsToFollow
												newPodcastsToFollow.push(
													podcastToFollow._id,
												);
											} else {
												// splice out index
												newPodcastsToFollow.splice(index, 1);
											}
											this.setState({
												checkedPodcastsToFollow: newPodcastsToFollow,
											});
										}}
										type="checkbox"
									/>
									<span>{podcastToFollow.title}</span>
								</label>
							</div>
						);
					})}
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
					<h1>Add New Podcast</h1>
					<Img
						className="exit"
						onClick={() => {
							this.resetModal();
							this.props.toggleModal();
						}}
						src={exitIcon}
					/>
				</header>
				{currentView}
			</ReactModal>
		);
	}
}

AddPodcastModal.defaultProps = {
	isOpen: false,
};

AddPodcastModal.propTypes = {
	done: PropTypes.func.isRequired,
	isOpen: PropTypes.bool,
	toggleModal: PropTypes.func.isRequired,
};

export default AddPodcastModal;
