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
		return (
			<Panel
				className="folder-panel"
				hasHighlight={this.props.match.params.folderID}
				headerText="Folders"
			>
				{this.props.folders.map((folder) => {
					const open = folder._id === this.props.match.params.folderID;
					return (
						<>
							<Link
								className={`panel-element ${open ? 'highlighted' : ''}`}
								key={folder._id}
								to={`/folders/${folder._id}`}
							>
								{open ? <FolderLogoOpen /> : <FolderLogo />}
								<div>{folder.name}</div>
								<div>
									<i
										className={`fa fa-chevron-${
											open ? 'down' : 'right'
										}`}
									/>
								</div>
							</Link>
							{open &&
								folder.feeds.map((f) => (
									<Link
										className={`panel-element folder-element ${
											open ? 'highlighted' : ''
										}`}
										key={f._id}
										to={`/${
											f.categories === 'rss' ? 'rss' : 'podcasts'
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
									</Link>
								))}
						</>
					);
				})}
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

export default connect(mapStateToProps)(withRouter(FolderList));
