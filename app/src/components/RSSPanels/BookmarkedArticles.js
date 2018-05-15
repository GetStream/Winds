import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import fetch from '../../util/fetch';
import Panel from '../Panel';
import { Link } from 'react-router-dom';
import getPlaceholderImageURL from '../../util/getPlaceholderImageURL';
import Img from 'react-image';
import TimeAgo from '../TimeAgo';

class BookmarkedArticles extends React.Component {
	componentDidMount() {
		fetch('GET', '/pins', null, {
			type: 'article',
			user: localStorage['authedUser'],
		}).then(response => {
			for (let pin of response.data) {
				// dispatch update to rss feeds
				this.props.dispatch({
					rssFeed: pin.article.rss,
					type: 'UPDATE_RSS_FEED',
				});
				// dispatch updates to articles
				this.props.dispatch({
					rssArticle: { ...pin.article, type: 'article' },
					type: 'UPDATE_ARTICLE',
				});
				// dispatch updates to pins
				this.props.dispatch({
					pin,
					type: 'PIN_ARTICLE',
				});
			}
		});
	}
	render() {
		return (
			<Panel headerText="Bookmarks">
				{this.props.bookmarks.map(bookmark => {
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
									getPlaceholderImageURL(bookmark.article.rss._id),
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
				let pin = { ...state.pinnedArticles[articleID] };
				pin.article = { ...state.articles[articleID] };
				pin.article.rss = { ...state.rssFeeds[pin.article.rss] };
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
