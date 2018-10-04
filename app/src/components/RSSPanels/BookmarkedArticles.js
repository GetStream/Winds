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
		if (!this.props.bookmarks.length) getPinnedArticles(this.props.dispatch);
	}

	render() {
		const bookmarks = this.props.bookmarks.sort(
			(a, b) => moment(b.createdAt).valueOf() - moment(a.createdAt).valueOf(),
		);

		return (
			<Panel headerText="Bookmarks">
				{bookmarks.map((bookmark) => {
					return (
						<Link
							key={bookmark._id}
							to={`/rss/${bookmark.article.rss._id}/articles/${
								bookmark.article._id
							}`}
						>
							<Img
								loader={<div className="placeholder" />}
								src={[
									bookmark.article.rss.images.favicon,
									getPlaceholderImageURL(bookmark._id),
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

const mapStateToProps = (state) => ({
	bookmarks: state.pinnedArticles ? Object.values(state.pinnedArticles) : [],
});

export default connect(mapStateToProps)(BookmarkedArticles);
