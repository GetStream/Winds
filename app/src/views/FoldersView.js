import React from 'react';
import PropTypes from 'prop-types';
import Popover from 'react-popover';
import { connect } from 'react-redux';
import { Route, Switch, withRouter } from 'react-router-dom';

import FolderFeeds from '../components/Folder/FolderFeeds';
import RenameModal from '../components/Folder/RenameModal';
import DeleteModal from '../components/Folder/DeleteModal';
import Loader from '../components/Loader';
import Tabs from '../components/Tabs';
import RecentNotesPanel from '../components/Notes/RecentNotesPanel';
import FolderList from '../components/Folder/FolderList';
import BookmarkedArticles from '../components/RSSPanels/BookmarkedArticles';

import { ReactComponent as FolderIcon } from '../images/icons/folder.svg';

class FoldersView extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			renameModal: false,
			deleteModal: false,
			menuPopover: false,
		};
	}

	toggleMenuPopover = () => {
		this.setState((prevState) => ({ menuPopover: !prevState.menuPopover }));
	};

	toggleRenameModal = () => {
		this.setState((prevState) => ({
			renameModal: !prevState.renameModal,
			menuPopover: false,
		}));
	};

	toggleDeleteModal = () => {
		this.setState((prevState) => ({
			deleteModal: !prevState.deleteModal,
			menuPopover: false,
		}));
	};

	menuPopover = (
		<div className="popover-panel feed-popover">
			<div className="panel-element menu-item" onClick={this.toggleRenameModal}>
				Rename
			</div>
			<div
				className="panel-element menu-item alert"
				onClick={this.toggleDeleteModal}
			>
				Delete
			</div>
		</div>
	);

	render() {
		return (
			<div
				className="folder-view"
				onKeyDown={(e) => e.keyCode === 27 && this.props.history.goBack()}
				tabIndex="-1"
			>
				<Tabs
					componentClass="panels"
					headerClass="panels-header"
					headerComponent={<h1>Folders</h1>}
					tabGroup="folder-view"
				>
					<div tabTitle="All Folders">
						<RecentNotesPanel />
						<FolderList />
					</div>
					<div tabTitle="Tags">{/* <TagsPanel /> */}</div>
					<div tabTitle="Bookmarks">
						<BookmarkedArticles />
					</div>
				</Tabs>

				<div className="border" />

				<Switch>
					<Route
						path="/folders/:folderID"
						render={() => {
							if (!this.props.folder._id) return <Loader />;
							return (
								<>
									<div className="list-view-header content-header">
										<div className="alignment-box">
											<FolderIcon className="folder-icon" />
											<h1>{this.props.folder.name}</h1>
											<Popover
												body={this.menuPopover}
												isOpen={this.state.menuPopover}
												onOuterAction={this.toggleMenuPopover}
												preferPlace="below"
												tipSize={0.1}
											>
												<div
													className="menu"
													onClick={() =>
														this.toggleMenuPopover()
													}
												>
													&bull; &bull; &bull;
												</div>
											</Popover>
										</div>
									</div>

									<RenameModal
										defVal={this.props.folder.name}
										dispatch={this.props.dispatch}
										folderId={this.props.folder._id}
										isOpen={this.state.renameModal}
										toggleModal={this.toggleRenameModal}
									/>

									<DeleteModal
										dispatch={this.props.dispatch}
										folderId={this.props.folder._id}
										isOpen={this.state.deleteModal}
										onDelete={() =>
											this.props.history.replace('/folders')
										}
										toggleModal={this.toggleDeleteModal}
									/>

									<FolderFeeds folder={this.props.folder} />
								</>
							);
						}}
					/>

					<Route
						path="/folders"
						render={() => (
							<div className="list content">
								<div className="end">
									Select a folder from panel to see the feeds
								</div>
							</div>
						)}
					/>
				</Switch>
			</div>
		);
	}
}

FoldersView.defaultProps = {
	folder: {},
};

FoldersView.propTypes = {
	dispatch: PropTypes.func.isRequired,
	history: PropTypes.shape({
		goBack: PropTypes.func.isRequired,
		replace: PropTypes.func.isRequired,
	}).isRequired,
	match: PropTypes.shape({
		params: PropTypes.shape({
			folderID: PropTypes.string,
		}).isRequired,
	}).isRequired,
	folder: PropTypes.shape({
		_id: PropTypes.string,
		name: PropTypes.string,
		rss: PropTypes.array,
		podcast: PropTypes.array,
	}),
};

const mapStateToProps = (state, ownProps) => ({
	folder:
		state.folders && ownProps.match.params.folderID
			? state.folders.find((f) => f._id === ownProps.match.params.folderID)
			: {},
});

export default connect(mapStateToProps)(FoldersView);
