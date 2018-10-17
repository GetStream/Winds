import React from 'react';
import PropTypes from 'prop-types';
import Img from 'react-image';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router-dom';

import Panel from '../Panel';
import getPlaceholderImageURL from '../../util/getPlaceholderImageURL';
import { ReactComponent as FolderLogo } from '../../images/icons/folder.svg';
import { ReactComponent as FolderLogoOpen } from '../../images/icons/folder-open.svg';

class FolderList extends React.Component {
	render() {
		const params = this.props.match.params;

		return (
			<Panel
				className="folder-panel"
				fragmentChild={true}
				hasHighlight={!!params.folderID}
				headerText="Folders"
			>
				{this.props.folders.reduce((result, folder) => {
					const open = folder._id === params.folderID;

					result.push(
						<Link
							className={open ? 'highlighted' : ''}
							key={folder._id}
							to={`/folders/${folder._id}`}
						>
							{open ? <FolderLogoOpen /> : <FolderLogo />}
							<div>{folder.name}</div>
							<div>
								<i
									className={`fa fa-chevron-${open ? 'down' : 'right'}`}
								/>
							</div>
						</Link>,
					);

					if (open) {
						const folderView = !(params.rssFeedID || params.podcastID);
						folder.feeds.map((f) => {
							const feedOpen =
								folderView ||
								f._id === params.rssFeedID ||
								f._id === params.podcastID;
							result.push(
								<Link
									className={`folder-element ${
										feedOpen ? 'highlighted' : ''
									}`}
									key={f._id}
									to={`/folders/${folder._id}/${
										f.categories === 'rss' ? 'r' : 'p'
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
										{f.categories === 'rss' ? 'RSS' : 'PODCAST'}
									</div>
								</Link>,
							);
						});
					}

					return result;
				}, [])}
			</Panel>
		);
	}
}

FolderList.defaultProps = {
	folders: [],
};

FolderList.propTypes = {
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
		folder.feeds = [...folder.rss, ...folder.podcast];
		if (state.aliases) {
			folder.feeds = folder.feeds.map((feed) => {
				if (state.aliases[feed._id]) feed.title = state.aliases[feed._id].alias;
				return feed;
			});
		}
		folder.feeds.sort((a, b) => a.title.localeCompare(b.title));
		return folder;
	});
	return { folders };
};

export default withRouter(connect(mapStateToProps)(FolderList));
