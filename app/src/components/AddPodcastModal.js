import React from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import { Img } from 'react-image';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import fetch from '../util/fetch';

import saveIcon from '../images/icons/save.svg';
import exitIcon from '../images/buttons/exit.svg';

class AddPodcastModal extends React.Component {
	constructor(props) {
		super(props);

		this.resetState = {
			checkedPodcastsToFollow: [],
			errorMessage: '',
			errored: false,
			podcastInputValue: '',
			podcastsToFollow: [],
			stage: 'submit-podcast-url',
			submitting: false,
			success: false,
		};

		this.state = { ...this.resetState };
	}

	resetModal = () => {
		this.setState({ ...this.resetState });
	};

	submitPodcastURL = (e) => {
		e.preventDefault();

		this.setState({
			errorMessage: '',
			errored: false,
			submitting: true,
			success: false,
		});

		fetch('POST', '/podcasts', { feedUrl: this.state.podcastInputValue })
			.then((res) => {
				for (let podcast of res.data) {
					this.props.dispatch({
						podcast,
						type: 'UPDATE_PODCAST_SHOW',
					});
				}
				this.setState({
					podcastsToFollow: res.data,
					stage: 'select-podcasts',
					submitting: false,
				});
			})
			.catch(() => {
				this.setState({
					errorMessage: 'Oops, something went wrong. Please try again later.',
					errored: true,
					submitting: false,
				});
			});
	};

	submitPodcastSelections = (e) => {
		e.preventDefault();

		this.setState({
			errorMessage: '',
			errored: false,
			submitting: true,
			success: false,
		});
		// TODO: FIX Dispatch
		Promise.all(
			this.state.checkedPodcastsToFollow.map((checkedPodcastToFollow) => {
				return fetch('post', '/follows', null, {
					podcast: checkedPodcastToFollow,
					type: 'podcast',
				}).then((res) => {
					this.props.dispatch({
						podcastID: res.data.podcast,
						type: 'FOLLOW_PODCAST',
					});
					return res.data.podcast;
				});
			}),
		).then((podcastIDs) => {
			this.setState({
				submitting: false,
				success: true,
			});
			this.props.history.push(`/podcasts/${podcastIDs[0]}`);
			setTimeout(() => {
				this.resetModal();
				this.props.done();
			}, 1500);
		});
	};

	render() {
		let buttonText = 'Submit';
		if (this.state.submitting) buttonText = 'Submitting...';
		else if (this.state.success) buttonText = 'Success!';

		let currentView = null;
		if (this.state.stage === 'submit-podcast-url') {
			currentView = (
				<form onSubmit={this.submitPodcastURL}>
					<div className="input-box">
						<input
							autoComplete="false"
							onChange={(e) =>
								this.setState({ podcastInputValue: e.target.value })
							}
							placeholder="Enter URL"
							type="text"
							value={this.state.podcastInputValue}
						/>
					</div>
					<div className="info">
						Enter a valid podcast URL and we&#39;ll add it to Winds.
					</div>
					<div className="error-message">{this.state.errorMessage}</div>
					<div className="buttons">
						<button
							className="btn primary alt with-circular-icon"
							disabled={
								this.state.submitting ||
								this.state.success ||
								this.state.podcastInputValue.trim() === ''
							}
							type="submit"
						>
							<Img decode={false} src={saveIcon} />
							<span className="button-text">Add Podcast</span>
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
						We found a few podcasts with that URL. Once your selection has
						been made, we will begin to process the podcasts. They will be
						ready shortly after.
					</div>
					{this.state.podcastsToFollow.map((podcastToFollow) => {
						return (
							<div key={podcastToFollow._id}>
								<label>
									<input
										checked={this.state.checkedPodcastsToFollow.includes(
											podcastToFollow._id,
										)}
										onChange={() => {
											let newPodcastsToFollow = [
												...this.state.checkedPodcastsToFollow,
											];

											let index = newPodcastsToFollow.findIndex(
												(element) => {
													return (
														element === podcastToFollow._id
													);
												},
											);

											if (index === -1) {
												newPodcastsToFollow.push(
													podcastToFollow._id,
												);
											} else {
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
							disabled={
								this.state.submitting ||
								this.state.success ||
								!this.state.checkedPodcastsToFollow.length
							}
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
	history: PropTypes.shape({ push: PropTypes.func.isRequired }).isRequired,
	dispatch: PropTypes.func.isRequired,
	done: PropTypes.func.isRequired,
	isOpen: PropTypes.bool,
	toggleModal: PropTypes.func.isRequired,
};

export default connect()(withRouter(AddPodcastModal));
