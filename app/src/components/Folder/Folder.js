import React from 'react';
import PropTypes from 'prop-types';
import Popover from 'react-popover';
import { connect } from 'react-redux';

import FolderFeeds from './FolderFeeds';
import RenameModal from './RenameModal';
import DeleteModal from './DeleteModal';
import Loader from '../Loader';

import { ReactComponent as FolderIcon } from '../../images/icons/folder.svg';
import { ReactComponent as CircleIcon } from '../../images/icons/circle.svg';
import { ReactComponent as DotCircleIcon } from '../../images/icons/dot-circle.svg';
import { ReactComponent as SettingIcon } from '../../images/icons/settings.svg';

class Folder extends React.Component {
	constructor(props) {
		super(props);

		// Folder sort requires custom ranking feature enables in Stream
		this.state = {
			renameModal: false,
			deleteModal: false,
			menuPopover: false,
			sortBy: 'latest',
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

	setSortBy = (sortBy) => {
		this.setState({ sortBy, menuPopover: false });
	};

	menuPopover = () => (
		<div className="popover-panel feed-popover">
			<div
				className="panel-element menu-item sort-button"
				onClick={() => this.setSortBy('latest')}
			>
				{this.state.sortBy === 'latest' ? <DotCircleIcon /> : <CircleIcon />}
				Latest
			</div>
			<div
				className="panel-element menu-item sort-button"
				onClick={() => this.setSortBy('oldest')}
			>
				{this.state.sortBy === 'oldest' ? <DotCircleIcon /> : <CircleIcon />}
				Oldest
			</div>
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
		if (!this.props.folder._id) return <Loader />;

		return (
			<>
				<div className="list-view-header content-header">
					<div className="alignment-box">
						<FolderIcon className="header-icon" />
						<h1>{this.props.folder.name}</h1>

						<div className="right">
							<Popover
								body={this.menuPopover()}
								isOpen={this.state.menuPopover}
								onOuterAction={this.toggleMenuPopover}
								preferPlace="below"
								tipSize={0.1}
							>
								<div onClick={this.toggleMenuPopover}>
									<SettingIcon />
								</div>
							</Popover>
						</div>
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
					folder={this.props.folder}
					isOpen={this.state.deleteModal}
					onDelete={() => this.props.history.replace('/folders')}
					toggleModal={this.toggleDeleteModal}
				/>

				<FolderFeeds folder={this.props.folder} sortBy={this.state.sortBy} />
			</>
		);
	}
}

Folder.defaultProps = {
	folder: {},
};

Folder.propTypes = {
	dispatch: PropTypes.func.isRequired,
	history: PropTypes.shape({
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

export default connect(mapStateToProps)(Folder);
