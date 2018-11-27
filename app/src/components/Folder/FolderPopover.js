import React from 'react';
import PropTypes from 'prop-types';
import Popover from 'react-popover';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import FeedToFolderModal from './FeedToFolderModal';
import Loader from '../Loader';
import { updateFolder } from '../../api/folderAPI';

import { ReactComponent as FolderIcon } from '../../images/icons/folder.svg';
import { ReactComponent as FolderSelectedIcon } from '../../images/icons/folder-select.svg';

class FolderPopover extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			folderPopover: false,
			folderModal: false,
			loading: false,
		};
	}

	updateFolder = (targetId) => {
		if (this.state.loading) return;

		this.setState({ loading: true });

		const currFolder = this.getCurrentFolder();

		let data = {};
		data[this.props.isRss ? 'rss' : 'podcast'] = this.props.feedID;
		if (currFolder === targetId) data = { ...data, action: 'remove' };

		//todo Update url
		updateFolder(
			this.props.dispatch,
			targetId,
			data,
			() => {
				const url = this.props.history.location.pathname.replace(
					this.props.match.params.folderID,
					currFolder === targetId ? 'undefined' : targetId,
				);
				this.props.history.replace(url);
				this.setState({ loading: false });
				this.toggleFolderPopover();
			},
			() => this.setState({ loading: false }),
		);
	};

	toggleFolderModal = () => {
		this.setState((prevState) => ({ folderModal: !prevState.folderModal }));
	};

	toggleFolderPopover = () => {
		this.setState((prevState) => ({ folderPopover: !prevState.folderPopover }));
	};

	getCurrentFolder = () => {
		const folder = this.props.folders.find((folder) => this.isCurrentFolder(folder));
		return folder && folder._id;
	};

	isCurrentFolder = (folder) => {
		for (const feed of folder[this.props.isRss ? 'rss' : 'podcast'])
			if (this.props.feedID === feed._id) return true;
		return false;
	};

	render() {
		const folderPopover = (
			<div className="popover-panel feed-popover">
				{this.props.folders.map((folder) => (
					<div
						className="panel-element menu-item"
						key={folder._id}
						onClick={() => this.updateFolder(folder._id)}
					>
						{this.isCurrentFolder(folder) ? (
							<FolderSelectedIcon />
						) : (
							<FolderIcon />
						)}
						<span>{folder.name}</span>
					</div>
				))}

				<div className="panel-element menu-item" onClick={this.toggleFolderModal}>
					<span className="green">Create new folder</span>
				</div>
			</div>
		);

		return (
			<>
				<Popover
					body={folderPopover}
					isOpen={this.state.folderPopover}
					onOuterAction={this.toggleFolderPopover}
					preferPlace="below"
					tipSize={0.1}
				>
					<div onClick={this.toggleFolderPopover}>
						{this.state.loading ? (
							<Loader defaultLoader={false} radius={18} />
						) : (
							<FolderIcon />
						)}
					</div>
				</Popover>

				<FeedToFolderModal
					currFolderID={this.getCurrentFolder()}
					dispatch={this.props.dispatch}
					feedID={this.props.feedID}
					history={this.props.history}
					isOpen={this.state.folderModal}
					isRss={this.props.isRss}
					toggleModal={this.toggleFolderModal}
				/>
			</>
		);
	}
}

FolderPopover.defaultProps = {
	folders: [],
};

FolderPopover.propTypes = {
	folders: PropTypes.array,
	isRss: PropTypes.bool,
	feedID: PropTypes.string,
	dispatch: PropTypes.func.isRequired,
	history: PropTypes.shape({
		location: PropTypes.shape({ pathname: PropTypes.string.isRequired }).isRequired,
		replace: PropTypes.func.isRequired,
	}).isRequired,
	match: PropTypes.shape({
		params: PropTypes.shape({ folderID: PropTypes.string }),
	}),
};

const mapStateToProps = (state) => ({
	folders: state.folders || [],
});

export default withRouter(connect(mapStateToProps)(FolderPopover));
