import md5 from 'md5';
import ReshareModal from '../ReshareModal';
import SocialIcons from '../SocialIcons';
import Drawer from '../Drawer';
import CommentsSection from '../CommentsSection';
import CommentInputBox from '../CommentInputBox';
import Avatar from '../Avatar';
import moment from 'moment';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import React from 'react';
import MediaCard from '../MediaCard';
import TimeAgo from '../TimeAgo';
import fetch from '../../util/fetch';
import { connect } from 'react-redux';

class UserShare extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			reshareModalIsOpen: false,
			showDrawer: false,
		};
		this.toggleDrawer = this.toggleDrawer.bind(this);
		this.toggleReshareModal = this.toggleReshareModal.bind(this);
		this.handleCommentPost = this.handleCommentPost.bind(this);
		this.like = this.like.bind(this);
		this.unlike = this.unlike.bind(this);
	}
	componentDidMount() {
		fetch('get', '/comments', null, {
			share: this.props._id,
		})
			.then(response => {
				for (let comment of response.data) {
					this.props.updateComment(comment);
				}
			})
			.catch(err => {
				console.log(err); // eslint-disable-line no-console
			});
	}
	toggleDrawer() {
		this.setState({
			showDrawer: !this.state.showDrawer,
		});
	}
	toggleReshareModal() {
		this.setState({
			reshareModalIsOpen: !this.state.reshareModalIsOpen,
		});
	}
	handleCommentPost(commentText) {
		return new Promise((resolve, reject) => {
			fetch('POST', '/comments', {
				share: this.props._id,
				text: commentText,
			})
				.then(response => {
					this.props.updateComment(response.data);
					resolve();
				})
				.catch(err => {
					console.log(err); // eslint-disable-line no-console
					reject();
				});
		});
	}
	like() {
		this.props.dispatchLike(this.props._id);

		fetch('POST', '/likes', {
			share: this.props._id,
		}).catch(err => {
			// rollback on failure
			this.props.dispatchUnlike(this.props._id);
			console.log(err); // eslint-disable-line no-console
		});
	}
	unlike() {
		this.props.dispatchUnlike(this.props._id);

		fetch('DELETE', '/likes', null, {
			share: this.props._id,
		}).catch(err => {
			// rollback if it fails
			this.props.dispatchLike(this.props._id);

			console.log(err); // eslint-disable-line no-console
		});
	}
	render() {
		let mediaCard = null;
		if (this.props.share) {
			mediaCard = (
				<MediaCard
					author={this.props.share.user.name}
					image={`https://www.gravatar.com/avatar/${md5(
						this.props.share.user.email,
					)}?s=200`}
					link={`/profile/${this.props.share.user._id}`}
					title={this.props.share.text}
					type="share"
				/>
			);
		}

		let thisUserShare = (
			<div className="activity">
				<div className="about">
					<div className="icon">
						<Link to={`/profile/${this.props.user._id}`}>
							<Avatar height={40} width={40}>
								{this.props.user.email}
							</Avatar>
						</Link>
					</div>
					<div className="title">
						<div className="action">
							<Link to={`/profile/${this.props.user._id}`}>
								<span className="name">{this.props.user.username}</span>{' '}
							</Link>
							<span className="verb">shared</span>{' '}
							<span className="descriptor" />{' '}
							<span className="item">something</span>
						</div>
						<div className="time-ago">
							<TimeAgo timestamp={this.props.createdAt} />
						</div>
					</div>
				</div>
				<div className="text">{this.props.text}</div>
				{mediaCard}
			</div>
		);

		return (
			<div>
				{thisUserShare}
				<SocialIcons
					comments={this.props.comments}
					isLiked={this.props.liked}
					like={this.like}
					likeCount={this.props.likes}
					openCommentsSection={this.toggleDrawer}
					showCommentIcon={true}
					toggleReshareModal={this.toggleReshareModal}
					unlike={this.unlike}
				/>
				<Drawer closeDrawer={this.toggleDrawer} isOpen={this.state.showDrawer}>
					{thisUserShare}
					<SocialIcons
						comments={this.props.comments}
						isLiked={this.props.liked}
						like={this.like}
						likeCount={this.props.likes}
						openCommentsSection={this.toggleDrawer}
						showCommentIcon={false}
						toggleReshareModal={this.toggleReshareModal}
						unlike={this.unlike}
					/>
					<CommentInputBox
						postComment={this.handleCommentPost}
						userEmail={this.props.user.email}
					/>
					<CommentsSection comments={this.props.comments} />
				</Drawer>
				<ReshareModal
					authedUserEmail={this.props.userEmail}
					authedUserID={this.props.userID}
					forActivityID={this.props._id}
					reshareModalIsOpen={this.state.reshareModalIsOpen}
					toggleModal={this.toggleReshareModal}
				/>
			</div>
		);
	}
}

UserShare.defaultProps = {
	comments: [],
	liked: false,
	likes: 0,
};

UserShare.propTypes = {
	_id: PropTypes.string.isRequired,
	comments: PropTypes.arrayOf(PropTypes.shape({})),
	createdAt: PropTypes.string,
	dispatchLike: PropTypes.func.isRequired,
	dispatchUnlike: PropTypes.func.isRequired,
	liked: PropTypes.bool,
	likes: PropTypes.number,
	share: PropTypes.shape({
		text: PropTypes.string,
		user: PropTypes.shape({
			_id: PropTypes.string,
			email: PropTypes.string,
			name: PropTypes.string,
		}),
	}),
	shares: PropTypes.number,
	text: PropTypes.string,
	updateComment: PropTypes.func.isRequired,
	user: PropTypes.shape({
		_id: PropTypes.string,
		email: PropTypes.string,
		username: PropTypes.string,
	}),
	userEmail: PropTypes.string,
	userID: PropTypes.string,
};

const mapStateToProps = (state, ownProps) => {
	// loop through all comments, and find the ones that match this shareID
	let comments = [];
	for (var commentID in state.comments) {
		if (state.comments.hasOwnProperty(commentID)) {
			if (state.comments[commentID].share === ownProps._id) {
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
		...ownProps,
		comments,
		userEmail: user.email,
		userID: user._id,
		userName: user.name,
	};
};

const mapDispatchToProps = dispatch => {
	return {
		dispatchLike: shareID => {
			dispatch({
				objectID: shareID,
				objectType: 'share',
				type: 'LIKE',
			});
		},
		dispatchUnlike: shareID => {
			dispatch({
				objectID: shareID,
				objectType: 'share',
				type: 'UNLIKE',
			});
		},
		updateComment: comment => {
			dispatch({
				comment,
				type: 'UPDATE_COMMENT',
			});
			dispatch({
				type: 'UPDATE_USER',
				user: comment.user,
			});
		},
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(UserShare);
