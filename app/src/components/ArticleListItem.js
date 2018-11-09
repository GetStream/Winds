import { withRouter } from 'react-router-dom';
import TimeAgo from './TimeAgo';
import React from 'react';
import Img from 'react-image';
import PropTypes from 'prop-types';
import getPlaceholderImageURL from '../util/getPlaceholderImageURL';
import { pinArticle, unpinArticle } from '../util/pins';
import { connect } from 'react-redux';

class ArticleListItem extends React.Component {
	render() {
		const folderView = this.props.location.pathname.includes('folders');
		const tagView = this.props.location.pathname.includes('tags');
		const id = this.props._id;
		const rssId = this.props.rss._id;
		const folderId = this.props.foldersFeed[rssId];

		return (
			<div
				className="list-item"
				onClick={() => {
					if (this.props.onNavigation) this.props.onNavigation();

					this.props.history.push(
						folderView || tagView
							? `/folders/${folderId}/r/${rssId}/a/${id}`
							: `/rss/${rssId}/articles/${id}`,
					);
				}}
			>
				<div className="left">
					<Img
						height="75"
						loader={<div className="placeholder" />}
						src={[this.props.images.og, getPlaceholderImageURL(id)]}
						width="75"
					/>
					{this.props.recent && <div className="recent-indicator" />}
				</div>
				<div className="right">
					<h2>{this.props.title}</h2>
					<div className="item-info">
						<span
							className="bookmark"
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								this.props.pinID
									? unpinArticle(
										this.props.pinID,
										id,
										this.props.dispatch,
									  )
									: pinArticle(id, this.props.dispatch);
							}}
						>
							{this.props.pinID ? (
								<i className="fas fa-bookmark" />
							) : (
								<i className="far fa-bookmark" />
							)}
						</span>
						<span>
							<i className="fas fa-external-link-alt" />
							<a href={this.props.url}>{this.props.rss.title}</a>
						</span>
						{!!this.props.commentUrl && (
							<span>
								<i className="fas fa-comment-alt" />
								<a href={this.props.commentUrl}>Comments</a>
							</span>
						)}
						<span className="muted">
							{'Posted '}
							<TimeAgo timestamp={this.props.publicationDate} />
						</span>
					</div>
					<div className="description">{this.props.description}</div>
				</div>
			</div>
		);
	}
}

ArticleListItem.defaultProps = {
	images: {},
	liked: false,
	likes: 0,
	pinID: '',
	recent: false,
};

ArticleListItem.propTypes = {
	_id: PropTypes.string.isRequired,
	commentUrl: PropTypes.string,
	description: PropTypes.string,
	dispatch: PropTypes.func.isRequired,
	history: PropTypes.shape({
		push: PropTypes.func.isRequired,
	}).isRequired,
	images: PropTypes.shape({
		og: PropTypes.string,
	}),
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
});

export default connect(mapStateToProps)(withRouter(ArticleListItem));
