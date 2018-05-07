import { Link, withRouter } from 'react-router-dom';
import React, { Component } from 'react';
import Img from 'react-image';
import PropTypes from 'prop-types';
import axios from 'axios';
import config from '../../config';
import { connect } from 'react-redux';

class Login extends Component {
	constructor(props) {
		super(props);
		this.state = {
			email: '',
			errorMessage: '',
			password: '',
		};
		this.submit = this.submit.bind(this);
		this.isValid = this.isValid.bind(this);
	}

	isValid() {
		return this.state.email.trim !== '' && this.state.password !== '';
	}

	submit(e) {
		e.preventDefault();

		axios
			.post(config.api.url + '/auth/login', {
				email: this.state.email,
				password: this.state.password,
			})
			.then(res => {
				window.localStorage.setItem('jwt', res.data.jwt);
				window.localStorage.setItem('authedUser', res.data._id);

				if (!res.data.interests || res.data.interests.length < 3) {
					this.props.history.push('/onboarding');
				} else {
					this.props.history.push('/');
				}
			})
			.catch(() => {
				this.setState({
					password: '',
					errorMessage:
						'It looks like you have entered an incorrect email or password. Please try again.',
				});
			});
	}

	render() {
		return (
			<div className="center">
				<div className="login-wrapper">
					<div className="logo">
						<Img src="images/logos/full.svg" />
					</div>
					<div className="cta">
						<p>
							RSS &amp; Podcasts in one place.<br />
							Sign in to continue with Winds.
						</p>
					</div>
					<div className="form">
						<form id="sign-in" onSubmit={this.submit}>
							<label>
								Email<br />
								<input
									autoFocus={true}
									name="email"
									onChange={e => {
										e.preventDefault();
										this.setState({
											email: e.target.value,
										});
									}}
									tabIndex="1"
									type="email"
								/>
							</label>
							<br />
							<label>
								Password
								<span className="forgot-password">
									<Link to={'/forgot-password'}>Forgot?</Link>
								</span>
								<br />
								<input
									name="password"
									onChange={e => {
										e.preventDefault();
										this.setState({
											password: e.target.value,
										});
									}}
									tabIndex="2"
									type="password"
									value={this.state.password}
								/>
							</label>
							<br />
							<button
								className="btn primary"
								disabled={!this.isValid()}
								name="sign-in"
								tabIndex="3"
								type="submit"
							>
								Sign In
							</button>
							<div className="error">{this.state.errorMessage}</div>
							<div className="alt">
								<p>
									New to Winds?{' '}
									<Link to={'/create-account'}>Create an Account</Link>
								</p>
							</div>
						</form>
					</div>
				</div>
			</div>
		);
	}
}

Login.propTypes = {
	history: PropTypes.shape({
		push: PropTypes.func.isRequired,
	}),
	signin: PropTypes.func,
};

const mapDispatchToProps = dispatch => {
	return {
		updateUser: user => {
			dispatch({
				type: 'UPDATE_USER',
				user,
			});
		},
	};
};

export default connect(null, mapDispatchToProps)(withRouter(Login));
