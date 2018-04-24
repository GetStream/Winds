import repostIcon from '../images/icons/repost.svg';
import filledLikeIcon from '../images/icons/like-filled.svg';
import likeIcon from '../images/icons/like.svg';
import commentIcon from '../images/icons/comment.svg';
import CommentsSection from './CommentsSection';
import Img from 'react-image';
import PropTypes from 'prop-types';
import React from 'react';
import ReshareModal from './ReshareModal';
import { connect } from 'react-redux';
import fetch from '../util/fetch';
import moment from 'moment';
import Drawer from './Drawer';

class LikeCommentReshare extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			reshareModalIsOpen: false,
			showCommentsSection: false,
		};
		this.toggleReshareModal = this.toggleReshareModal.bind(this);
		this.toggleCommentsSection = this.toggleCommentsSection.bind(this);
	}
	componentDidMount() {
		this.props.getComments();
	}
	toggleReshareModal(e) {
		e.preventDefault();
		e.stopPropogation();
		this.setState({
			reshareModalIsOpen: !this.state.reshareModalIsOpen,
		});
	}
	toggleCommentsSection(e) {
		e.preventDefault();
		e.stopPropogation();
		this.setState({
			showCommentsSection: !this.state.showCommentsSection,
		});
	}
	render() {
		return (
			<div>
				<div className="social">
					<div className="like" onClick={this.props.toggleLike}>
						{this.props.liked ? (
							<Img src={filledLikeIcon} />
						) : (
							<Img src={likeIcon} />
						)}
						<span>{this.props.likes}</span>
					</div>
					<div className="comment" onClick={this.toggleCommentsSection}>
						<Img onClick={this.handleCommentClick} src={commentIcon} />
						<span>{this.props.comments.length}</span>
					</div>

					<div className="repost" onClick={this.toggleReshareModal}>
						<Img src={repostIcon} />
						<span>{this.props.shares}</span>
					</div>
				</div>
				<ReshareModal
					authedUserEmail={this.props.userEmail}
					authedUserID={this.props.userID}
					forActivityID={this.props.activityID}
					reshareModalIsOpen={this.state.reshareModalIsOpen}
					toggleModal={this.toggleReshareModal}
				/>
				<Drawer
					closeDrawer={this.toggleCommentsSection}
					isOpen={this.state.showCommentsSection}
				>
					<CommentsSection
						comments={this.props.comments}
						shareID={this.props.activityID}
						showCommentsSection={true}
					/>
				</Drawer>
			</div>
		);
	}
}

LikeCommentReshare.propTypes = {
	activityID: PropTypes.string.isRequired,
	comments: PropTypes.arrayOf(PropTypes.shape({})),
	getComments: PropTypes.func.isRequired,
	liked: PropTypes.bool,
	likes: PropTypes.number,
	shares: PropTypes.number,
	toggleLike: PropTypes.func.isRequired,
	userEmail: PropTypes.string.isRequired,
	userID: PropTypes.string.isRequired,
};

LikeCommentReshare.defaultProps = {
	comments: [],
	liked: false,
	likes: 0,
	shares: 0,
};

const mapStateToProps = (state, ownProps) => {
	// loop through all comments, and find the ones that match this shareID
	let comments = [];
	for (var commentID in state.comments) {
		if (state.comments.hasOwnProperty(commentID)) {
			if (state.comments[commentID].share === ownProps.activityID) {
				let deserializedComment = {
					...state.comments[commentID],
					user: state.users[state.comments[commentID].user],
				};
				comments.push(deserializedComment);
			}
		}
	}
	// sort comments by time
	comments.sort((a, b) => {
		return moment(b.createdAt).valueOf() - moment(a.createdAt).valueOf();
	});

	let user = state.users[localStorage['authedUser']];

	return {
		comments,
		userEmail: user.email,
		userID: user._id,
		userName: user.name,
	};
};

const mapDispatchToProps = (dispatch, ownProps) => {
	return {
		getComments: () => {
			fetch('get', '/comments', null, {
				share: ownProps.activityID,
			})
				.then(res => {
					for (let comment of res.data) {
						dispatch({
							comment,
							type: 'UPDATE_COMMENT',
						});
						dispatch({
							type: 'UPDATE_USER',
							user: comment.user,
						});
					}
				})
				.catch(err => {
					console.log(err); // eslint-disable-line no-console
				});
		},

		toggleLike: () => {
			if (ownProps.liked) {
				// optimistic dispatch
				dispatch({
					objectID: ownProps.activityID,
					objectType: 'share',
					type: 'UNLIKE',
				});

				fetch('DELETE', '/likes', null, {
					share: ownProps.activityID,
				}).catch(err => {
					// rollback if it fails
					dispatch({
						objectID: ownProps.activityID,
						objectType: 'share',
						type: 'LIKE',
					});

					console.log(err); // eslint-disable-line no-console
				});
			} else {
				// optimistic dispatch
				dispatch({
					objectID: ownProps.activityID,
					objectType: 'share',
					type: 'LIKE',
				});

				fetch('POST', '/likes', {
					share: ownProps.activityID,
				}).catch(err => {
					// rollback on failure
					dispatch({
						objectID: ownProps.activityID,
						objectType: 'share',
						type: 'UNLIKE',
					});

					console.log(err); // eslint-disable-line no-console
				});
			}
		},
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(LikeCommentReshare);
