import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import Panel from '../Panel';
import { Link } from 'react-router-dom';
import getPlaceholderImageURL from '../../util/getPlaceholderImageURL';
import { getPinnedArticles } from '../../util/pins';
import Img from 'react-image';
import TimeAgo from '../TimeAgo';
import moment from 'moment';

class BookmarkedArticles extends React.Component {
	componentDidMount() {
		getPinnedArticles(this.props.dispatch);
	}

	render() {
		let sortedBookmarks = [...this.props.bookmarks].sort((a, b) => {
			return moment(b.createdAt).valueOf() - moment(a.createdAt).valueOf();
		});

		return (
			<Panel headerText="Bookmarks">
				{sortedBookmarks.map(bookmark => {
					return (
						<Link
							key={bookmark._id}
							to={`/rss/${bookmark.article.rss._id}/articles/${
								bookmark.article._id
							}`}
						>
							<Img
								src={[
									bookmark.article.rss.images.favicon,
									getPlaceholderImageURL(),
								]}
								loader={<div className="placeholder" />}
							/>
							<div>{bookmark.article.title}</div>
							<TimeAgo
								className="muted"
								timestamp={bookmark.article.publicationDate}
								trim={true}
							/>
						</Link>
					);
				})}
			</Panel>
		);
	}
}

BookmarkedArticles.defaultProps = {
	bookmarks: [],
};

BookmarkedArticles.propTypes = {
	bookmarks: PropTypes.arrayOf(PropTypes.shape()),
	dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = (state, ownProps) => {
	let bookmarks = [];

	for (var articleID in state.pinnedArticles) {
		if (state.pinnedArticles.hasOwnProperty(articleID)) {
			if (state.pinnedArticles[articleID]) {
				let pin = {
					...state.pinnedArticles[articleID],
				};
				pin.article = {
					...state.articles[articleID],
				};
				pin.article.rss = {
					...state.rssFeeds[pin.article.rss],
				};
				bookmarks.push(pin);
			}
		}
	}

	return {
		...ownProps,
		bookmarks,
	};
};

export default connect(mapStateToProps)(BookmarkedArticles);
