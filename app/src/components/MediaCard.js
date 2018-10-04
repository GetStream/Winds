import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import React from 'react';

const MediaCard = (props) => {
	let icon;

	if (props.type === 'share') {
		icon = 'retweet';
	} else if (props.type === 'episode') {
		icon = 'play';
	} else if (props.type === 'article') {
		icon = 'rss';
	}

	return (
		<Link className="media-card" to={props.link}>
			<div className="image">
				<div
					className="author-image"
					style={{ backgroundImage: `url(${props.image})` }}
				/>
				<div className="type-image-container">
					<i className={`type-image fas fa-${icon}`} />
				</div>
			</div>
			<div className="author">{props.author}</div>
			<div className="title">{props.title}</div>
		</Link>
	);
};

MediaCard.propTypes = {
	author: PropTypes.string,
	image: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.string), PropTypes.string]),
	link: PropTypes.string,
	title: PropTypes.string,
	type: PropTypes.string.isRequired,
};

export default MediaCard;
