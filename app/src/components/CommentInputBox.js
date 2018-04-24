import Avatar from './Avatar';
import Img from 'react-image';
import PropTypes from 'prop-types';
import React from 'react';
import pencilIcon from '../images/icons/pencil.svg';

class CommentInputBox extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			value: '',
		};
		this.handleSubmit = this.handleSubmit.bind(this);
	}
	handleSubmit(e) {
		e.preventDefault();
		this.props.postComment(this.state.value).then(() => {
			this.setState({
				value: '',
			});
		});
	}
	render() {
		return (
			<div className="comment-input-box">
				<Avatar>{this.props.userEmail}</Avatar>
				<form className="text-box" onSubmit={this.handleSubmit}>
					<textarea
						onChange={e => {
							this.setState({
								value: e.target.value,
							});
						}}
						placeholder="Leave a comment"
						value={this.state.value}
					/>
					<button
						className="btn primary with-icon"
						disabled={this.state.value.length === 0}
						type="submit"
					>
						<Img src={pencilIcon} value={this.state.value} />
						<span>Submit</span>
					</button>
				</form>
			</div>
		);
	}
}

CommentInputBox.propTypes = {
	postComment: PropTypes.func.isRequired,
	userEmail: PropTypes.string.isRequired,
};

export default CommentInputBox;
