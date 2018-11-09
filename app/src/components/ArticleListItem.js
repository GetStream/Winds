import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { pinArticle, unpinArticle } from '../util/pins';
import FeedListItem from './FeedListItem';

class ArticleListItem extends React.Component {
	render() {
		const folderView = this.props.location.pathname.includes('folders');
		const tagView = this.props.location.pathname.includes('tags');
		const id = this.props._id;
		const rssId = this.props.rss._id;
		const folderId = this.props.foldersFeed[rssId];
		const link =
			folderView || tagView
				? `/folders/${folderId}/r/${rssId}/a/${id}`
				: `/rss/${rssId}/articles/${id}`;

		const note = this.props.notes[id] || [];
		const highlightsNo = note.filter((h) => !h.text).length;
		const notesNo = note.length - highlightsNo;
		const tagsNo = this.props.tagsFeed.filter((tag) => tag === id).length;

		return (
			<FeedListItem
				{...this.props}
				feedTitle={this.props.rss.title}
				highlights={highlightsNo}
				link={link}
				notes={notesNo}
				onNavigation={this.props.onNavigation}
				pin={() => pinArticle(id, this.props.dispatch)}
				playable={false}
				tags={tagsNo}
				unpin={() => unpinArticle(this.props.pinID, id, this.props.dispatch)}
			/>
		);
	}
}

ArticleListItem.defaultProps = {
	images: {},
	pinID: '',
	recent: false,
};

ArticleListItem.propTypes = {
	_id: PropTypes.string.isRequired,
	description: PropTypes.string,
	dispatch: PropTypes.func.isRequired,
	images: PropTypes.shape({ og: PropTypes.string }),
	onNavigation: PropTypes.func,
	pinID: PropTypes.string,
	publicationDate: PropTypes.string,
	recent: PropTypes.bool,
	rss: PropTypes.shape({
		_id: PropTypes.string,
		title: PropTypes.string,
	}),
	title: PropTypes.string,
	url: PropTypes.string,
	foldersFeed: PropTypes.shape({}),
	location: PropTypes.shape({ pathname: PropTypes.string }).isRequired,
};

const mapStateToProps = (state) => ({
	foldersFeed: state.foldersFeed || {},
	tagsFeed: state.tagsFeed || [],
	notes: state.notes || {},
});

export default connect(mapStateToProps)(withRouter(ArticleListItem));
