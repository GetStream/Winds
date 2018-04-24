import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import Comment from './Comment';

class CommentsSection extends React.Component {
	render() {
		return (
			<div className="comment-section">
				<div className="comment-list">
					{this.props.comments.map(comment => {
						return <Comment key={comment._id} {...comment} />;
					})}
				</div>
			</div>
		);
	}
}

CommentsSection.defaultProps = {
	comments: [],
	showCommentsSection: false,
};

CommentsSection.propTypes = {
	comments: PropTypes.arrayOf(PropTypes.shape({})),
	showCommentsSection: PropTypes.bool,
	user: PropTypes.shape({}),
};

const mapStateToProps = (state, ownProps) => {
	return {
		...ownProps,
		user: state.users[localStorage['authedUser']],
	};
};

const mapDispatchToProps = (dispatch, ownProps) => {
	return {
		...ownProps,
	};
};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
	return {
		...ownProps,
		...dispatchProps,
		...stateProps,
	};
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(CommentsSection);
