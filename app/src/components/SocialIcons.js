import repostIcon from '../images/icons/repost.svg';
import filledLikeIcon from '../images/icons/like-filled.svg';
import commentIcon from '../images/icons/comment.svg';
import likeIcon from '../images/icons/like.svg';
import React from 'react';
import PropTypes from 'prop-types';
import Img from 'react-image';

class SocialIcons extends React.Component {
	render() {
		return (
			<div className="social">
				<div
					className="like"
					onClick={() => {
						if (!this.props.isLiked) {
							this.props.like();
						} else {
							this.props.unlike();
						}
					}}
				>
					{this.props.isLiked ? (
						<Img src={filledLikeIcon} />
					) : (
						<Img src={likeIcon} />
					)}
					<span>{this.props.likeCount}</span>
				</div>
				{this.props.showCommentIcon ? (
					<div
						className="comment"
						onClick={() => {
							if (this.props.openCommentsSection) {
								this.props.openCommentsSection();
							}
						}}
					>
						<Img onClick={this.handleCommentClick} src={commentIcon} />
						<span>{this.props.comments.length}</span>
					</div>
				) : null}

				<div className="repost" onClick={this.props.toggleReshareModal}>
					<Img src={repostIcon} />
					<span>{this.props.shareCount}</span>
				</div>
			</div>
		);
	}
}

SocialIcons.defaultProps = {
	isLiked: false,
	likeCount: 0,
	shareCount: 0,
	showCommentIcon: true,
};

SocialIcons.propTypes = {
	comments: PropTypes.arrayOf(PropTypes.shape({})),
	isLiked: PropTypes.bool,
	like: PropTypes.func.isRequired,
	likeCount: PropTypes.number,
	openCommentsSection: PropTypes.func,
	shareCount: PropTypes.number,
	showCommentIcon: PropTypes.bool,
	toggleReshareModal: PropTypes.func,
	unlike: PropTypes.func.isRequired,
};

export default SocialIcons;
