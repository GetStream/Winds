import Avatar from './Avatar';
import React from 'react';
import PropTypes from 'prop-types';
import fetch from '../util/fetch';

class Comment extends React.Component {
	setFlagOnComment() {
		let existingFlags = {};
		if (localStorage['flaggedComments']) {
			existingFlags = JSON.parse(localStorage['flaggedComments']);
		}
		existingFlags[this.props._id] = true;
		localStorage['flaggedComments'] = JSON.stringify(existingFlags);
		this.forceUpdate();
		fetch('PUT', `/comments/${this.props._id}`, { flags: this.props.flags + 1 });
	}
	render() {
		if (
			(localStorage['flaggedComments'] &&
				JSON.parse(localStorage['flaggedComments'])[this.props._id]) ||
			this.props.flags >= 5
		) {
			return null;
		} else {
			return (
				<div className="comment">
					<div className="user-avatar">
						<Avatar>{this.props.user.email}</Avatar>
					</div>
					<div className="name">{this.props.user.username}</div>
					<div className="text">{this.props.text}</div>
					<div
						className="elements"
						onClick={() => {
							this.setFlagOnComment(this.props._id);
						}}
					>
						<i className="far fa-flag" />
					</div>
				</div>
			);
		}
	}
}

Comment.defaultProps = {
	flags: 0,
	text: '',
};

Comment.propTypes = {
	_id: PropTypes.string.isRequired,
	flags: PropTypes.number,
	text: PropTypes.string,
	user: PropTypes.shape({
		email: PropTypes.string,
		username: PropTypes.string,
	}),
};

export default Comment;
