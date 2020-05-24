import React from 'react';
import PropTypes from 'prop-types';

import Tag from './Tag/Tag';
import TimeAgo from './TimeAgo';
import { Img } from 'react-image';
import getPlaceholderImageURL from '../util/getPlaceholderImageURL';

import { ReactComponent as LinkIcon } from '../images/icons/link.svg';
import { ReactComponent as BookmarkIcon } from '../images/icons/bookmark.svg';
import { ReactComponent as BookmarkedIcon } from '../images/icons/bookmarked.svg';
import { ReactComponent as PauseIcon } from '../images/icons/pause.svg';
import { ReactComponent as PlayIcon } from '../images/icons/play.svg';

class FeedHeader extends React.Component {
	render() {
		const {
			_id,
			title,
			images,
			url,
			publicationDate,
			pinID,
			pin,
			unpin,
			tweet,
			commentUrl,
			recent,
			hackernews,
			reddit,
			type,
		} = this.props;

		const { playOrPauseEpisode, playable, isPlaying } = this.props;

		return (
			<div className="content-header feed-header">
				<div
					className={`photo ${playable ? 'clickable' : ''}`}
					onClick={() => playable && playOrPauseEpisode()}
				>
					<Img
						height="50"
						loader={<div className="placeholder" />}
						src={[images.og, getPlaceholderImageURL(_id)]}
						width="50"
					/>
					{playable && (
						<div className="play-icon">
							<div className="icon-container">
								{isPlaying ? <PauseIcon /> : <PlayIcon />}
							</div>
						</div>
					)}
				</div>

				<TimeAgo className="date muted" timestamp={publicationDate} />

				<h1 className="title">{title}</h1>

				<div className="item-info">
					<a href={url}>
						<LinkIcon />
					</a>

					{recent && <div className="recent-indicator" />}

					<span className="clickable" onClick={() => (pinID ? unpin() : pin())}>
						{pinID ? <BookmarkedIcon /> : <BookmarkIcon />}
					</span>

					<span className="clickable" onClick={() => tweet()}>
						<i className="fab fa-twitter" />
					</span>

					{commentUrl && (
						<a href={commentUrl}>
							<i className="fas fa-comment" />
						</a>
					)}

					{reddit && (
						<a href={reddit.url} rel="noopener noreferrer" target="_blank">
							{reddit.score}
							<i className="fab fa-reddit-alien" />
						</a>
					)}

					{hackernews && (
						<a
							href={hackernews.url}
							rel="noopener noreferrer"
							target="_blank"
						>
							{hackernews.score}
							<i className="fab fa-hacker-news-square" />
						</a>
					)}

					<Tag feedId={_id} type={type} />
				</div>
			</div>
		);
	}
}

FeedHeader.propTypes = {
	type: PropTypes.string.isRequired,
	_id: PropTypes.string.isRequired,
	title: PropTypes.string.isRequired,
	publicationDate: PropTypes.string,
	url: PropTypes.string,
	commentUrl: PropTypes.string,
	images: PropTypes.shape({ og: PropTypes.string }),
	tweet: PropTypes.func,
	pin: PropTypes.func,
	unpin: PropTypes.func,
	pinID: PropTypes.string,
	recent: PropTypes.bool,
	hackernews: PropTypes.shape({}),
	reddit: PropTypes.shape({}),
	playOrPauseEpisode: PropTypes.func,
	playable: PropTypes.bool,
	isPlaying: PropTypes.bool,
};

export default FeedHeader;
