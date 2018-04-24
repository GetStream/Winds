import { Link } from 'react-router-dom';
import React from 'react';
import TimeAgo from './TimeAgo';
import PropTypes from 'prop-types';
import MediaCard from './MediaCard';
import getPlaceholderImageURL from '../util/getPlaceholderImageURL';
import Img from 'react-image';

const ArticleActivityItem = props => {
	return (
		<div className="activity">
			<div className="about">
				<div className="icon">
					<Link to={`/rss/${props.rss._id}`}>
						<Img
							src={[
								props.rss.images.favicon,
								getPlaceholderImageURL(props.rss._id),
							]}
						/>
					</Link>
				</div>
				<div className="title">
					<div className="action">
						<Link to={`/rss/${props.rss._id}`}>
							<span className="name">{props.rss.title}</span>{' '}
						</Link>
						<span className="verb">published</span>{' '}
						<span className="descriptor" />{' '}
						<span className="item">a new article</span>
					</div>
					<div className="time-ago">
						<TimeAgo timestamp={props.publicationDate} />
					</div>
				</div>
			</div>
			<MediaCard
				author={props.rss.title}
				image={props.images.og || getPlaceholderImageURL(props.rss._id)}
				link={`/rss/${props.rss._id}/articles/${props._id}`}
				title={props.title}
				type="article"
			/>
		</div>
	);
};

ArticleActivityItem.defaultProps = {
	images: {},
};

ArticleActivityItem.propTypes = {
	_id: PropTypes.string.isRequired,
	images: PropTypes.shape({ og: PropTypes.string }),
	publicationDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
	rss: PropTypes.shape({
		_id: PropTypes.string.isRequired,
		images: PropTypes.shape({
			favicon: PropTypes.string,
		}),
		title: PropTypes.string.isRequired,
	}).isRequired,
	title: PropTypes.string.isRequired,
};

export default ArticleActivityItem;
