import likeIcon from '../images/icons/like.svg';
import filledLikeIcon from '../images/icons/like-filled.svg';
import inactivePinLogo from '../images/icons/pin-inactive.svg';
import pinIcon from '../images/icons/pin.svg';
import Img from 'react-image';
import { Link } from 'react-router-dom';
import TimeAgo from './TimeAgo';
import React from 'react';
import PropTypes from 'prop-types';
import getPlaceholderImageURL from '../util/getPlaceholderImageURL';

const ArticleListItem = props => {
	return (
		<Link className="list-item" to={`/rss/${props.rssFeedID}/articles/${props._id}`}>
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
				<div className="info">
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
							<Img src={pinIcon} />
						) : (
							<Img src={inactivePinLogo} />
						)}
					</span>
					<span
						className="likes"
						onClick={e => {
							e.preventDefault();
							e.stopPropagation();
							if (props.liked) {
								props.unlike(props._id);
							} else {
								props.like(props._id);
							}
						}}
					>
						{props.liked ? (
							<Img src={filledLikeIcon} />
						) : (
							<Img src={likeIcon} />
						)}
						{props.likes}
					</span>
					<TimeAgo timestamp={props.publicationDate} />
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
	description: PropTypes.string,
	favicon: PropTypes.string,
	images: PropTypes.shape({ og: PropTypes.string }),
	like: PropTypes.func.isRequired,
	liked: PropTypes.bool,
	likes: PropTypes.number,
	pinArticle: PropTypes.func.isRequired,
	pinned: PropTypes.bool,
	publicationDate: PropTypes.string,
	rssFeedID: PropTypes.string.isRequired,
	title: PropTypes.string,
	unlike: PropTypes.func.isRequired,
	unpinArticle: PropTypes.func.isRequired,
};
export default ArticleListItem;
