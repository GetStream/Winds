import React from 'react';
import PropTypes from 'prop-types';
import { Img } from 'react-image';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router-dom';

import NewFolderModal from './NewFolderModal';
import getPlaceholderImageURL from '../../util/getPlaceholderImageURL';
import { ReactComponent as FolderIcon } from '../../images/icons/folder.svg';
import { ReactComponent as FolderIconOpen } from '../../images/icons/folder-open.svg';
import { ReactComponent as AddIcon } from '../../images/icons/add-green.svg';

/* Follows the same structure of Panel component */
class FolderPanel extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			modal: false,
		};
	}

	toggleModal = () => {
		this.setState((prevState) => ({ modal: !prevState.modal }));
	};

	render() {
		const params = this.props.match.params;

		return (
			<>
				<div className={`panel ${params.folderID ? 'hasHighlight' : ''}`}>
					<div className="panel-header">
						Folders
						<AddIcon className="right click" onClick={this.toggleModal} />
					</div>

					<div className="panel-contents">
						{this.props.folders.reduce((result, folder) => {
							const open = folder._id === params.folderID;

							result.push(
								<Link
									className={`panel-element ${
										open ? 'highlighted' : ''
									}`}
									key={folder._id}
									to={`/folders/${folder._id}`}
								>
									{open ? <FolderIconOpen /> : <FolderIcon />}
									<div>{folder.name}</div>
									<div>
										<i
											className={`fa fa-chevron-${
												open ? 'down' : 'right'
											}`}
										/>
									</div>
								</Link>,
							);

							if (open) {
								const folderView = !(
									params.rssFeedID || params.podcastID
								);

								for (const f of folder.feeds) {
									const feedOpen =
										folderView ||
										f._id === params.rssFeedID ||
										f._id === params.podcastID;
									const isRss = f.categories.toLowerCase() === 'rss';
									result.push(
										<Link
											className={`panel-element folder-element ${
												feedOpen ? 'highlighted' : ''
											}`}
											key={f._id}
											to={`/folders/${folder._id}/${
												isRss ? 'r' : 'p'
											}/${f._id}`}
										>
											<Img
												loader={<div className="placeholder" />}
												src={[
													f.images ? f.images.favicon : null,
													getPlaceholderImageURL(f._id),
												]}
											/>
											<div>{f.title}</div>
											<div className="type">
												{isRss ? 'RSS' : 'PODCAST'}
											</div>
										</Link>,
									);
								}
							}

							return result;
						}, [])}
					</div>
				</div>

				<NewFolderModal
					isOpen={this.state.modal}
					toggleModal={this.toggleModal}
				/>
			</>
		);
	}
}

FolderPanel.defaultProps = {
	folders: [],
};

FolderPanel.propTypes = {
	folders: PropTypes.arrayOf(PropTypes.shape({})),
	match: PropTypes.shape({
		params: PropTypes.shape({
			folderID: PropTypes.string,
			rssFeedID: PropTypes.string,
			podcastID: PropTypes.string,
		}),
	}),
};

const mapStateToProps = (state) => {
	if (!state.folders) return { folders: [] };

	const folders = state.folders.map((folder) => {
		let feeds = [...folder.rss, ...folder.podcast];
		if (state.aliases) {
			feeds = feeds.map((feed) => {
				if (state.aliases[feed._id]) feed.title = state.aliases[feed._id].alias;
				return feed;
			});
		}
		feeds.sort((a, b) => a.title.localeCompare(b.title));
		return { ...folder, feeds };
	});
	return { folders };
};

export default withRouter(connect(mapStateToProps)(FolderPanel));
