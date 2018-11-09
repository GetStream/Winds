import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router-dom';

import Folder from '../components/Folder/Folder';
import TagView from '../components/Tag/TagView';
import RSSArticle from '../components/RSSArticle';
import PodcastEpisode from '../components/PodcastEpisode';
import RSSArticleList from '../components/RSSArticleList';
import PodcastEpisodesView from '../components/PodcastEpisodesView';
import Tabs from '../components/Tabs';
import RecentNotesPanel from '../components/Notes/RecentNotesPanel';
import FolderPanel from '../components/Folder/FolderPanel';
import BookmarkPanel from '../components/BookmarkPanel';
import TagPanel from '../components/Tag/TagPanel';

class FoldersView extends React.Component {
	render() {
		return (
			<div
				className="grid-view"
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
						<FolderPanel />
					</div>
					<div tabTitle="Tags">
						<TagPanel />
					</div>
					<div tabTitle="Bookmarks">
						<BookmarkPanel />
					</div>
				</Tabs>

				<div className="border" />

				<Switch>
					<Route component={TagView} path="/tags/:tagID" />
					<Route
						component={RSSArticle}
						path="/folders/:folderID/r/:rssFeedID/a/:articleID"
					/>
					<Route
						component={PodcastEpisode}
						path="/folders/:folderID/p/:podcastID/e/:episodeID"
					/>
					<Route
						component={PodcastEpisodesView}
						path="/folders/:folderID/p/:podcastID"
					/>
					<Route
						component={RSSArticleList}
						path="/folders/:folderID/r/:rssFeedID"
					/>
					<Route component={Folder} path="/folders/:folderID" />
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

FoldersView.propTypes = {
	history: PropTypes.shape({
		goBack: PropTypes.func.isRequired,
	}).isRequired,
	match: PropTypes.shape({
		params: PropTypes.shape({
			folderID: PropTypes.string,
		}).isRequired,
	}).isRequired,
};

export default connect()(FoldersView);
