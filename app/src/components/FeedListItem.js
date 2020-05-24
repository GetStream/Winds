import React from 'react';
import PropTypes from 'prop-types';
import { Img } from 'react-image';
import { Link } from 'react-router-dom';

import TimeAgo from './TimeAgo';
import getPlaceholderImageURL from '../util/getPlaceholderImageURL';

import { ReactComponent as NoteIcon } from '../images/icons/note.svg';
import { ReactComponent as BookmarkIcon } from '../images/icons/bookmark.svg';
import { ReactComponent as BookmarkedIcon } from '../images/icons/bookmarked.svg';
import { ReactComponent as PenIcon } from '../images/icons/pen.svg';
import { ReactComponent as TagIcon } from '../images/icons/tag-simple.svg';
import { ReactComponent as PauseIcon } from '../images/icons/pause.svg';
import { ReactComponent as PlayIcon } from '../images/icons/play.svg';

class FeedListItem extends React.Component {
	render() {
		const {
			_id,
			title,
			images,
			link,
			description,
			feedTitle,
			publicationDate,
			pinID,
			pin,
			unpin,
			onNavigation,
			notes,
			highlights,
			tags,
			recent,
		} = this.props;
		const { inPlayer, isPlaying, playable, playOrPauseEpisode } = this.props;

		return (
			<Link
				className="feed-list-item"
				onClick={() => onNavigation && onNavigation()}
				to={link}
			>
				<div
					className="left"
					onClick={(e) => {
						if (playable) {
							e.stopPropagation();
							e.preventDefault();
							playOrPauseEpisode();
						}
					}}
				>
					<Img
						height="100"
						loader={<div className="placeholder" />}
						src={[images.og, getPlaceholderImageURL(_id)]}
						width="100"
					/>

					{playable && (
						<div className={inPlayer ? 'pause-icon' : 'play-icon'}>
							<div className="icon-container">
								{inPlayer && isPlaying ? <PauseIcon /> : <PlayIcon />}
							</div>
						</div>
					)}

					{recent && <div className="recent-indicator" />}
				</div>
				<div className="right">
					<h2>{title}</h2>
					<div className="item-action">
						<span
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								pinID ? unpin() : pin();
							}}
						>
							{pinID ? <BookmarkedIcon /> : <BookmarkIcon />}
						</span>
						<span>
							<NoteIcon /> {notes} Note
							{notes > 1 && 's'}
						</span>
						<span>
							<PenIcon /> {highlights} Highlight
							{highlights > 1 && 's'}
						</span>
						<span>
							<TagIcon /> {tags} Tag
							{tags > 1 && 's'}
						</span>
					</div>

					<div className="item-info">
						<span>{feedTitle}</span>

						<span className="muted">
							{'Posted '}
							<TimeAgo timestamp={publicationDate} />
						</span>
					</div>
					<div className="description">{description}</div>
				</div>
			</Link>
		);
	}
}

FeedListItem.defaultProps = {
	images: {},
};

FeedListItem.propTypes = {
	_id: PropTypes.string.isRequired,
	title: PropTypes.string.isRequired,
	description: PropTypes.string,
	publicationDate: PropTypes.string,
	feedTitle: PropTypes.string,
	link: PropTypes.string,
	images: PropTypes.shape({ og: PropTypes.string }),
	onNavigation: PropTypes.func,
	pin: PropTypes.func,
	unpin: PropTypes.func,
	pinID: PropTypes.string,
	recent: PropTypes.bool,
	notes: PropTypes.number,
	highlights: PropTypes.number,
	tags: PropTypes.number,
	playOrPauseEpisode: PropTypes.func,
	playable: PropTypes.bool,
	inPlayer: PropTypes.bool,
	isPlaying: PropTypes.bool,
};

export default FeedListItem;
