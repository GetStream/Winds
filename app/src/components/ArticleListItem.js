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
		return (
			<div
				className="list-item"
				onClick={() => {
					if (this.props.onNavigation) {
						this.props.onNavigation();
					}
					this.props.history.push(
						`/rss/${this.props.rss._id}/articles/${this.props._id}`,
					);
				}}
			>
				<div className="left">
					<Img
						width="75"
						height="75"
						src={[
							this.props.images.og,
							getPlaceholderImageURL(this.props._id),
						]}
						loader={<div className="placeholder" />}
					/>
					{this.props.recent ? <div className="recent-indicator" /> : null}
				</div>
				<div className="right">
					<h2>{this.props.title}</h2>
					<div className="item-info">
						<span
							className="bookmark"
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								if (this.props.pinned) {
									unpinArticle(
										this.props.pinID,
										this.props._id,
										this.props.dispatch,
									);
								} else {
									pinArticle(this.props._id, this.props.dispatch);
								}
							}}
						>
							{this.props.pinned ? (
								<i className="fas fa-bookmark" />
							) : (
								<i className="far fa-bookmark" />
							)}
						</span>
						<span>
							<i className="fas fa-external-link-alt" />
							<a href={this.props.url}>{this.props.rss.title}</a>
						</span>
						{this.props.commentUrl ? (
							<span>
								<i className="fas fa-comment-alt" />
								<a href={this.props.commentUrl}>Comments</a>
							</span>
						) : null}
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
	pinned: false,
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
	pinned: PropTypes.bool,
	publicationDate: PropTypes.string,
	recent: PropTypes.bool,
	rss: PropTypes.shape({
		_id: PropTypes.string,
		title: PropTypes.string,
	}),
	title: PropTypes.string,
	url: PropTypes.string,
};

export default connect()(withRouter(ArticleListItem));
