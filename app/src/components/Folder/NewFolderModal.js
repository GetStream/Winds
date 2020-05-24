import React from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import { Img } from 'react-image';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import getPlaceholderImageURL from '../../util/getPlaceholderImageURL';
import SearchFeed from './SearchFeed';
import { newFolder } from '../../api/folderAPI';
import { ReactComponent as RemoveIcon } from '../../images/icons/remove.svg';

class NewFolderModal extends React.Component {
	constructor(props) {
		super(props);

		this.resetState = {
			feeds: [],
			name: '',
			errored: false,
			submitting: false,
			success: false,
		};

		this.state = { ...this.resetState };
	}

	submitNewFolder = (e) => {
		e.preventDefault();

		if (!this.state.name) return this.setState({ errored: true });

		this.setState({ errored: false, submitting: true, success: false });

		const rss = this.state.feeds
			.filter((feed) => feed.type === 'rss')
			.map((feed) => feed._id);

		const podcast = this.state.feeds
			.filter((feed) => feed.type === 'podcast')
			.map((feed) => feed._id);

		newFolder(
			this.props.dispatch,
			{ name: this.state.name, rss, podcast },
			({ data }) => {
				this.setState({ submitting: false, success: true });
				setTimeout(() => {
					this.closeModal();
					this.props.history.push(`/folders/${data._id}`);
				}, 1500);
			},
			(err) => {
				console.log(err); // eslint-disable-line no-console
				this.setState({ errored: true, submitting: false });
			},
		);
	};

	closeModal = () => {
		this.setState({ ...this.resetState });
		this.props.toggleModal();
	};

	addFeed = (feed) => {
		if (this.state.feeds.some((f) => f._id === feed._id)) return;
		this.setState({ feeds: [...this.state.feeds, { ...feed }] });
	};

	removeFeed = (index) => {
		const feeds = [...this.state.feeds];
		feeds.splice(index, 1);
		this.setState({ feeds });
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
					<h1>Create a new folder</h1>
				</header>

				<form onSubmit={this.submitNewFolder}>
					<div className="input-box">
						<input
							autoComplete="false"
							onChange={(e) =>
								this.setState({ name: e.target.value, errored: false })
							}
							placeholder="Folder name"
							type="text"
							value={this.state.name}
						/>
					</div>
					<div className="info">Select at least one feed:</div>

					<SearchFeed addFeed={this.addFeed} />

					<div className="folder-feed-list panel">
						{this.state.feeds.map((result, i) => (
							<div className="feed-item panel-element" key={result._id}>
								<div className="left">
									<Img
										src={getPlaceholderImageURL(result._id)}
										width="25"
									/>
								</div>
								<div className="center">{result.title}</div>
								<div className="right type">
									{result.type.toUpperCase()}
								</div>
								<RemoveIcon
									className="btn-remove"
									onClick={() => this.removeFeed(i)}
								/>
							</div>
						))}
					</div>

					{this.state.errored && (
						<div className="error-message">
							{this.state.name
								? 'Oops, something went wrong. Please try again.'
								: 'Your folder needs a name!'}
						</div>
					)}

					<div className="buttons">
						<button
							className="btn primary alt"
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

NewFolderModal.defaultProps = {
	isOpen: false,
};

NewFolderModal.propTypes = {
	history: PropTypes.shape({ push: PropTypes.func.isRequired }).isRequired,
	dispatch: PropTypes.func.isRequired,
	isOpen: PropTypes.bool,
	toggleModal: PropTypes.func.isRequired,
};

export default connect()(withRouter(NewFolderModal));
