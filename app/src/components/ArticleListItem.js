import { Link } from 'react-router-dom';
import TimeAgo from './TimeAgo';
import React from 'react';
import PropTypes from 'prop-types';
import getPlaceholderImageURL from '../util/getPlaceholderImageURL';

const ArticleListItem = props => {
	return (
		<Link className="list-item" to={`/rss/${props.rss._id}/articles/${props._id}`}>
			<div className="left">
				<div
					className="background-image"
					style={{
						backgroundImage: `url(${props.images.og ||
							getPlaceholderImageURL(props._id)})`,
					}}
				/>
			</div>
			<div className="right">
				<h2>{props.title}</h2>
				<div className="article-info">
					<span
						onClick={e => {
							e.preventDefault();
							e.stopPropagation();
							if (props.pinned) {
								props.unpinArticle(props._id);
							} else {
								props.pinArticle(props._id);
							}
						}}
					>
						{props.pinned ? (
							<i className="fa fa-bookmark" />
						) : (
							<i className="far fa-bookmark" />
						)}
					</span>
					<div>
						<i className="fas fa-external-link-alt" />
						<a href={props.url}>{props.rss.title}</a>
					</div>
					{props.commentUrl ? (
						<div>
							<i className="fas fa-comment-alt" />

							<a href={props.commentUrl}>Comments</a>
						</div>
					) : null}
					<span className="muted">
						{'Posted '}
						<TimeAgo timestamp={props.publicationDate} />
					</span>
				</div>
				<div>{props.description}</div>
			</div>
		</Link>
	);
};

ArticleListItem.defaultProps = {
	images: {},
	liked: false,
	likes: 0,
	pinned: false,
};

ArticleListItem.propTypes = {
	_id: PropTypes.string.isRequired,
	commentUrl: PropTypes.string,
	description: PropTypes.string,
	favicon: PropTypes.string,
	images: PropTypes.shape({ og: PropTypes.string }),
	liked: PropTypes.bool,
	likes: PropTypes.number,
	pinArticle: PropTypes.func.isRequired,
	pinned: PropTypes.bool,
	publicationDate: PropTypes.string,
	rss: PropTypes.shape({
		_id: PropTypes.string,
		title: PropTypes.string,
	}),
	title: PropTypes.string,
	unpinArticle: PropTypes.func.isRequired,
	url: PropTypes.string,
};
export default ArticleListItem;
