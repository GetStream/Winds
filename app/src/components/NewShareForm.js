import pencilIcon from '../images/icons/pencil.svg';
import React, { Component } from 'react';
import Avatar from './Avatar';
import Img from 'react-image';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import fetch from '../util/fetch';

class NewShareForm extends Component {
	constructor(props) {
		super(props);

		this.state = {
			text: '',
			valid: false,
		};

		this.validateText = this.validateText.bind(this);
		this.submit = this.submit.bind(this);
	}

	validateText(e) {
		let text = e.target.value;

		this.setState({
			text,
		});

		if (text.length >= 2) {
			this.setState({
				valid: true,
			});
		} else {
			this.setState({
				valid: false,
			});
		}
	}

	submit(e) {
		e.preventDefault();
		if (this.state.valid) {
			this.props.submitShare(this.state.text).then(() => {
				this.setState({
					text: '',
				});
			});
		}
	}

	render() {
		return (
			<div>
				<div className="share">
					<form onSubmit={this.submit}>
						<div className="inner">
							<Avatar>{this.props.userEmail}</Avatar>
							<textarea
								onChange={this.validateText}
								placeholder="Share something..."
								value={this.state.text}
							/>
						</div>
						<button
							className="btn primary alt with-icon send"
							disabled={!this.state.valid}
							type="submit"
						>
							<Img src={pencilIcon} />
							<span>Send</span>
						</button>
					</form>
				</div>
			</div>
		);
	}
}

NewShareForm.propTypes = {
	share: PropTypes.shape({
		text: PropTypes.string,
		user: PropTypes.shape({
			email: PropTypes.string,
		}),
	}),
	submitShare: PropTypes.func.isRequired,
	userEmail: PropTypes.string.isRequired,
	userID: PropTypes.string.isRequired,
};

const mapStateToProps = (state, ownProps) => {
	let user = state.users[localStorage['authedUser']];
	let props = {
		userEmail: user.email,
		userID: user._id,
	};
	return { ...props, ...ownProps };
};

const mapDispatchToProps = (dispatch, ownProps) => {
	return {
		submitShare: (text, userID) => {
			if (!text) {
				return;
			} else {
				let options = {
					text: text,
					user: userID,
				};

				if (ownProps.share) {
					options.share = ownProps.share;
				}

				fetch('POST', '/shares', options)
					.then(res => {
						dispatch({
							share: { ...res.data, type: 'share' },
							type: 'UPDATE_SHARE',
						});
						dispatch({
							activity: res.data,
							type: 'NEW_SHARE',
						});
						if (ownProps.onComplete) {
							ownProps.onComplete();
						}
					})
					.catch(err => {
						console.log(err); // eslint-disable-line no-console
					});
			}
		},
	};
};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
	const { submitShare } = dispatchProps;
	return {
		...ownProps,
		...stateProps,
		submitShare: text => {
			return new Promise(resolve => {
				submitShare(text, ownProps.userID);
				resolve();
			});
		},
	};
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(NewShareForm);
