import Avatar from '../Avatar';
import LikeCommentReshare from '../LikeCommentReshare';
import PropTypes from 'prop-types';
import React from 'react';
import TimeAgo from '../TimeAgo';
import numeral from 'numeral';

class RSSNewArticle extends React.Component {
	render() {
		return (
			<div className="activity" key={this.props.feedActivity.id}>
				<div className="about">
					<div className="icon">
						<Avatar height={40} width={40} />
					</div>
					<div className="title">
						<div className="action">
							<span className="name">
								{this.props.feedActivity.rss.title}
							</span>{' '}
							<span className="verb">posted</span>{' '}
							<span className="descriptor">a new</span>{' '}
							<span className="item">article.</span>
						</div>
						<div className="time-ago">
							<TimeAgo timestamp={this.props.feedActivity.createdAt} />
						</div>
					</div>
				</div>
				<div className="text">{this.props.feedActivity.text}</div>
				<div className="content">
					<div className="right">
						<div className="name">{this.props.feedActivity.podcastID}</div>
						<div className="title">{this.props.feedActivity.media.title}</div>
						<div className="stats">
							<div className="left">
								{numeral(this.props.views).format('0,0')}{' '}
								{parseInt(this.props.views, 10) === 1 ? 'View' : 'Views'}
							</div>
							<div className="right">
								<TimeAgo
									timestamp={this.props.feedActivity.media.releaseDate}
								/>
							</div>
						</div>
					</div>
				</div>

				<LikeCommentReshare />
				<div className="spacer" />
			</div>
		);
	}
}

RSSNewArticle.defaultProps = {
	views: 0,
};

RSSNewArticle.propTypes = {
	feedActivity: PropTypes.object,
	views: PropTypes.number,
};

export default RSSNewArticle;
