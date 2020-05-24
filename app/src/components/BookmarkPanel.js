import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Img } from 'react-image';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';

import TimeAgo from './TimeAgo';
import Panel from './Panel';
import getPlaceholderImageURL from '../util/getPlaceholderImageURL';
import { getPinnedArticles, getPinnedEpisodes } from '../util/pins';

class BookmarkPanel extends React.Component {
	componentDidMount() {
		if (!this.props.articles.length) getPinnedArticles(this.props.dispatch);
		if (!this.props.episodes.length) getPinnedEpisodes(this.props.dispatch);
	}

	render() {
		let bookmarks = [];
		const folderView =
			this.props.location.pathname.includes('folders') ||
			this.props.location.pathname.includes('tags');
		const foldersFeed = this.props.foldersFeed;

		if (this.props.type === 'article') bookmarks = this.props.articles;
		else if (this.props.type === 'episode') bookmarks = this.props.episodes;
		else bookmarks = [...this.props.articles, ...this.props.episodes];

		bookmarks = bookmarks.sort(
			(a, b) => moment(b.createdAt).valueOf() - moment(a.createdAt).valueOf(),
		);

		return (
			<Panel headerText="Bookmarks">
				{bookmarks.map((bookmark) => {
					if (bookmark.article)
						return (
							<Link
								key={bookmark.article._id}
								to={
									folderView
										? `/folders/${
												foldersFeed[bookmark.article.rss._id]
										  }/r/${bookmark.article.rss._id}/a/${
												bookmark.article._id
										  }`
										: `/rss/${bookmark.article.rss._id}/articles/${bookmark.article._id}`
								}
							>
								<Img
									loader={<div className="placeholder" />}
									src={[
										bookmark.article.rss.images.favicon,
										getPlaceholderImageURL(bookmark.article._id),
									]}
								/>
								<div>{bookmark.article.title}</div>
								<TimeAgo
									className="muted"
									timestamp={bookmark.article.publicationDate}
									trim={true}
								/>
							</Link>
						);
					else
						return (
							<Link
								key={bookmark.episode._id}
								to={
									folderView
										? `/folders/${
												foldersFeed[bookmark.episode.podcast._id]
										  }/p/${bookmark.episode.podcast._id}/e/${
												bookmark.episode._id
										  }`
										: `/podcasts/${bookmark.episode.podcast._id}/episodes/${bookmark.episode._id}`
								}
							>
								<Img
									loader={<div className="placeholder" />}
									src={[
										bookmark.episode.podcast.images.favicon,
										getPlaceholderImageURL(bookmark.episode._id),
									]}
								/>
								<div>{bookmark.episode.title}</div>
								<TimeAgo
									className="muted"
									timestamp={bookmark.episode.publicationDate}
									trim={true}
								/>
							</Link>
						);
				})}
			</Panel>
		);
	}
}

BookmarkPanel.defaultProps = {
	articles: [],
	episodes: [],
};

BookmarkPanel.propTypes = {
	dispatch: PropTypes.func.isRequired,
	location: PropTypes.shape({ pathname: PropTypes.string }).isRequired,
	type: PropTypes.string,
	articles: PropTypes.arrayOf(PropTypes.shape()),
	episodes: PropTypes.arrayOf(PropTypes.shape()),
	foldersFeed: PropTypes.shape({}),
};

const mapStateToProps = (state) => ({
	articles: state.pinnedArticles ? Object.values(state.pinnedArticles) : [],
	episodes: state.pinnedEpisodes ? Object.values(state.pinnedEpisodes) : [],
	foldersFeed: state.foldersFeed || {},
});

export default connect(mapStateToProps)(withRouter(BookmarkPanel));
