import React from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import { connect } from 'react-redux';

import { newFolder, updateFolder } from '../../api/folderAPI';
import { ReactComponent as FolderIcon } from '../../images/icons/folder.svg';

class FeedToFolderModal extends React.Component {
	constructor(props) {
		super(props);

		this.resetState = {
			feedId: null,
			name: '',
			newFolder: false,
			remove: false,
			errored: false,
			errMsg: '',
			submitting: false,
			success: false,
			displayResults: false,
			selected: -1,
		};

		this.state = { ...this.resetState };
	}

	componentDidMount() {
		if (this.props.currFolderID && this.props.folders)
			this.setState({
				selected: this.props.folders.findIndex(
					(folder) => folder._id === this.props.currFolderID,
				),
			});
	}

	componentDidUpdate(prevProps) {
		if (!prevProps.currFolderID && this.props.currFolderID) {
			this.setState({
				selected: this.props.folders.findIndex(
					(folder) => folder._id === this.props.currFolderID,
				),
			});
		}
	}

	submit = (e) => {
		e.preventDefault();
		this.setState({ errored: false, submitting: true, success: false, errMsg: '' });

		if (this.state.newFolder) {
			if (!this.state.name)
				return this.setState({
					errored: true,
					submitting: false,
					errMsg: 'Your folder needs a name!',
				});

			const feed = this.props.isRss
				? { rss: [this.props.feedID] }
				: { podcast: [this.props.feedID] };

			newFolder(
				this.props.dispatch,
				{ name: this.state.name, ...feed },
				() => {
					this.setState({ submitting: false, success: true });
					setTimeout(() => this.closeModal(), 1500);
				},
				(err) => {
					console.log(err); // eslint-disable-line no-console
					this.setState({ errored: true, submitting: false });
				},
			);
		} else {
			if (
				this.state.selected ===
				this.props.folders.findIndex(
					(folder) => folder._id === this.props.currFolderID,
				)
			) {
				return this.closeModal();
			}

			if (this.state.selected === -1)
				return this.setState({
					errored: true,
					submitting: false,
					errMsg: 'Please select a folder!',
				});

			let data = this.props.isRss
				? { rss: this.props.feedID }
				: { podcast: this.props.feedID };

			let folderId;
			if (this.state.selected === this.props.folders.length + 1) {
				folderId = this.props.currFolderID;
				data = { ...data, action: 'remove' };
			} else folderId = this.props.folders[this.state.selected]._id;

			updateFolder(
				this.props.dispatch,
				folderId,
				data,
				() => {
					this.setState({ submitting: false, success: true });
					setTimeout(() => this.closeModal(), 1500);
				},
				(err) => {
					console.log(err); // eslint-disable-line no-console
					this.setState({ errored: true, submitting: false });
				},
			);
		}
	};

	closeModal = () => {
		this.setState({ ...this.resetState });
		this.props.toggleModal();
	};

	handleKeyDown = (e) => {
		const len = this.props.folders.length;
		if (e.keyCode === 27 || e.keyCode === 13) {
			e.preventDefault();
			e.stopPropagation();
			if (this.state.selected === len) this.setState({ newFolder: true });
			this.setState({ displayResults: false });
		} else if (e.keyCode === 40) {
			e.preventDefault();
			const pos = this.state.selected;
			this.setState({ selected: pos >= len + 1 ? 0 : pos + 1 });
		} else if (e.keyCode === 38) {
			e.preventDefault();
			const pos = this.state.selected;
			this.setState({ selected: pos <= 0 ? len + 1 : pos - 1 });
		}
	};

	render() {
		const folders = this.props.folders;

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
					<h1>
						{this.state.newFolder
							? 'Add feed to New Folder'
							: 'Add to Folder'}
					</h1>
				</header>

				<form onSubmit={this.submit}>
					{this.state.newFolder && (
						<div className="input-box">
							<input
								autoComplete="false"
								onChange={(e) =>
									this.setState({
										name: e.target.value,
										errored: false,
									})
								}
								placeholder="Folder name"
								type="text"
								value={this.state.name}
							/>
						</div>
					)}

					{!this.state.newFolder && (
						<div className="search-feed">
							<div
								className="select-box"
								onClick={() => {
									this.setState({ displayResults: true });
								}}
								onKeyDown={this.handleKeyDown}
								tabIndex="-1"
							>
								<div className="folder-name">
									{(() => {
										if (this.state.selected === folders.length + 1)
											return 'REMOVE FROM FOLDER';
										if (this.state.selected === folders.length)
											return 'CREATE NEW FOLDER';
										if (this.state.selected === -1)
											return 'Select Folder';
										return folders[this.state.selected].name;
									})()}
								</div>
								<i className="fas fa-sort-down" />
							</div>

							{this.state.displayResults && (
								<div className="results panel">
									{folders.map((folder, i) => (
										<div
											className={`feed-item panel-element ${this
												.state.selected === i && 'selected'}`}
											key={folder._id}
											onClick={() =>
												this.setState({
													selected: i,
													displayResults: false,
												})
											}
										>
											<div className="left">
												<FolderIcon />
											</div>
											<div className="center">{folder.name}</div>
										</div>
									))}
									<div
										className={`feed-item panel-element ${this.state
											.selected === folders.length && 'selected'}`}
										onClick={() => this.setState({ newFolder: true })}
									>
										<div className="center clickable">
											Create new folder
										</div>
									</div>
									<div
										className={`feed-item panel-element ${this.state
											.selected ===
											folders.length + 1 && 'selected'}`}
										onClick={() =>
											this.setState({
												selected: folders.length + 1,
												displayResults: false,
											})
										}
									>
										<div className="center clickable alert">
											Remove from folder
										</div>
									</div>
								</div>
							)}
						</div>
					)}

					{this.state.errored && (
						<div className="error-message">
							{this.state.errMsg
								? this.state.errMsg
								: 'Oops, something went wrong. Please try again.'}
						</div>
					)}

					<div className="buttons">
						<button
							className={`btn ${
								this.state.selected === folders.length + 1
									? 'alert'
									: 'primary'
							}`}
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
};

FeedToFolderModal.propTypes = {
	dispatch: PropTypes.func.isRequired,
	isOpen: PropTypes.bool,
	toggleModal: PropTypes.func.isRequired,
	feedID: PropTypes.string,
	isRss: PropTypes.bool,
	folders: PropTypes.array,
	currFolderID: PropTypes.string,
};

const mapStateToProps = (state) => ({
	folders: state.folders || [],
});

export default connect(mapStateToProps)(FeedToFolderModal);
