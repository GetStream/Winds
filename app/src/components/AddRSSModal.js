import React from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import { Img } from 'react-image';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import fetch from '../util/fetch';

import saveIcon from '../images/icons/save.svg';
import rssIcon from '../images/icons/rss.svg';
import exitIcon from '../images/buttons/exit.svg';

class AddRSSModal extends React.Component {
	constructor(props) {
		super(props);

		this.resetState = {
			checkedFeedsToFollow: [],
			errorMessage: '',
			errored: false,
			feedsToFollow: [],
			rssInputValue: '',
			stage: 'submit-rss-url',
			submitting: false,
			success: false,
		};

		this.state = { ...this.resetState };
	}

	handleStageOneFormSubmit = (e) => {
		e.preventDefault();

		this.setState({
			errorMessage: '',
			errored: false,
			submitting: true,
			success: false,
		});

		fetch('POST', '/rss', { feedUrl: this.state.rssInputValue })
			.then((res) => {
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
			.catch(() => {
				this.setState({
					errorMessage: 'Oops, something went wrong. Please try again later.',
					errored: true,
					submitting: false,
				});
			});
	};

	resetModal = () => {
		this.setState({ ...this.resetState });
	};

	submitFeedSelections = (e) => {
		e.preventDefault();

		this.setState({
			errorMessage: '',
			errored: false,
			submitting: true,
			success: false,
		});

		// TODO: FIX Dispatch
		Promise.all(
			this.state.checkedFeedsToFollow.map((checkedFeedToFollow) => {
				return fetch('post', '/follows', null, {
					rss: checkedFeedToFollow,
					type: 'rss',
				}).then((res) => {
					this.props.dispatch({
						rssFeedID: res.data.rss,
						type: 'FOLLOW_RSS_FEED',
					});
					return res.data.rss;
				});
			}),
		)
			.then((rssFeeds) => {
				this.setState({
					submitting: false,
					success: true,
				});
				this.props.history.push(`/rss/${rssFeeds[0]}`);
				setTimeout(() => {
					this.resetModal();
					this.props.done();
				}, 1500);
			})
			.catch((err) => {
				this.setState({
					errorMessage: err.message,
					submitting: false,
					success: false,
				});
			});
	};

	render = () => {
		let buttonText = 'Submit';
		if (this.state.submitting) buttonText = 'Submitting...';
		else if (this.state.success) buttonText = 'Success!';

		let currentView = null;
		if (this.state.stage === 'submit-rss-url') {
			currentView = (
				<form onSubmit={this.handleStageOneFormSubmit}>
					<div className="input-box">
						<input
							autoComplete="false"
							onChange={(e) =>
								this.setState({ rssInputValue: e.target.value })
							}
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
					<div className="buttons">
						<button
							className="btn primary alt with-circular-icon"
							disabled={
								this.state.submitting ||
								this.state.success ||
								this.state.rssInputValue.trim() === ''
							}
							type="submit"
						>
							<Img src={saveIcon} />
							<span className="button-text">Add RSS</span>
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
						Once your selection has been made, we will begin to process the
						feeds. They will be ready shortly after.
					</div>
					{this.state.feedsToFollow.map((feedToFollow) => {
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
												(element) => {
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
							disabled={
								this.state.submitting ||
								this.state.success ||
								!this.state.checkedFeedsToFollow.length
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
	};
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
