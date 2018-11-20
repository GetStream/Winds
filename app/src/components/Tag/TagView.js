import React from 'react';
import PropTypes from 'prop-types';
import Popover from 'react-popover';
import { connect } from 'react-redux';

import TagFeeds from './TagFeeds';
import DeleteModal from './DeleteModal';
import RenameModal from './RenameModal';
import Loader from '../Loader';

import { ReactComponent as TagIcon } from '../../images/icons/tag-simple.svg';
import { ReactComponent as CircleIcon } from '../../images/icons/circle.svg';
import { ReactComponent as DotCircleIcon } from '../../images/icons/dot-circle.svg';
import { ReactComponent as SettingIcon } from '../../images/icons/settings.svg';

class TagView extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			deleteModal: false,
			renameModal: false,
			menuPopover: false,
			sortBy: 'latest',
		};
	}

	toggleMenuPopover = () => {
		this.setState((prevState) => ({ menuPopover: !prevState.menuPopover }));
	};

	toggleDeleteModal = () => {
		this.setState((prevState) => ({
			deleteModal: !prevState.deleteModal,
			menuPopover: false,
		}));
	};

	toggleRenameModal = () => {
		this.setState((prevState) => ({
			renameModal: !prevState.renameModal,
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
		if (!this.props.tag._id) return <Loader />;

		return (
			<>
				<div className="list-view-header content-header">
					<div className="alignment-box">
						<TagIcon className="header-icon" />
						<h1>{this.props.tag.name}</h1>

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
					defVal={this.props.tag.name}
					dispatch={this.props.dispatch}
					isOpen={this.state.renameModal}
					onDelete={() => this.props.history.replace('/folders')}
					tagId={this.props.tag._id}
					toggleModal={this.toggleRenameModal}
				/>

				<DeleteModal
					dispatch={this.props.dispatch}
					isOpen={this.state.deleteModal}
					onDelete={() => this.props.history.replace('/folders')}
					tagId={this.props.tag._id}
					toggleModal={this.toggleDeleteModal}
				/>

				<TagFeeds sortBy={this.state.sortBy} tag={this.props.tag} />
			</>
		);
	}
}

TagView.defaultProps = {
	tag: {},
};

TagView.propTypes = {
	dispatch: PropTypes.func.isRequired,
	history: PropTypes.shape({
		replace: PropTypes.func.isRequired,
	}).isRequired,
	match: PropTypes.shape({
		params: PropTypes.shape({
			tagID: PropTypes.string,
		}).isRequired,
	}).isRequired,
	tag: PropTypes.shape({
		_id: PropTypes.string,
		name: PropTypes.string,
		article: PropTypes.array,
		episode: PropTypes.array,
	}),
};

const mapStateToProps = (state, ownProps) => ({
	tag:
		state.tags && ownProps.match.params.tagID
			? state.tags.find((f) => f._id === ownProps.match.params.tagID)
			: {},
});

export default connect(mapStateToProps)(TagView);
