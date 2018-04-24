import Img from 'react-image';
import { Link } from 'react-router-dom';
import React from 'react';
import TimeAgo from './TimeAgo';
import PropTypes from 'prop-types';
import MediaCard from './MediaCard';
import getPlaceholderImageURL from '../util/getPlaceholderImageURL';

const EpisodeActivityItem = props => {
	return (
		<div className="activity">
			<div className="about">
				<div className="icon">
					<Link to={`/podcasts/${props.podcast._id}`}>
						<Img
							src={[
								props.podcast.images.favicon,
								getPlaceholderImageURL(props.podcast._id),
							]}
						/>
					</Link>
				</div>
				<div className="title">
					<div className="action">
						<Link to={`/podcasts/${props.podcast._id}`}>
							<span className="name">{props.podcast.title}</span>{' '}
						</Link>
						<span className="verb">published</span>{' '}
						<span className="descriptor" />{' '}
						<span className="item">a new episode</span>
					</div>
					<div className="time-ago">
						<TimeAgo timestamp={props.publicationDate} />
					</div>
				</div>
			</div>
			<MediaCard
				author={props.podcast.title}
				image={
					props.podcast.images.favicon ||
					getPlaceholderImageURL(props.podcast._id)
				}
				link={`/podcasts/${props.podcast._id}`}
				title={props.title}
				type="episode"
			/>
		</div>
	);
};

EpisodeActivityItem.propTypes = {
	podcast: PropTypes.shape({
		_id: PropTypes.string.isRequired,
		images: PropTypes.shape({ favicon: PropTypes.string }),
		title: PropTypes.string.isRequired,
	}).isRequired,
	publicationDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
	title: PropTypes.string.isRequired,
};

export default EpisodeActivityItem;
