import { Link } from 'react-router-dom';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import axios from 'axios';
import config from '../../config';
import { getAllData } from '../../api';

class Login extends Component {
	constructor(props) {
		super(props);

		this.state = {
			email: '',
			errorMessage: '',
			password: '',
		};
	}

	isValid = () => {
		return this.state.email.trim !== '' && this.state.password !== '';
	};

	submit = (e) => {
		e.preventDefault();

		axios
			.post(config.api.url + '/auth/login', {
				email: this.state.email,
				password: this.state.password,
			})
			.then((res) => {
				window.streamAnalyticsClient.setUser({
					id: res.data._id,
					alias: res.data.email,
				});

				window.localStorage.setItem('jwt', res.data.jwt);
				window.localStorage.setItem('authedUser', res.data._id);
				getAllData(this.props.dispatch);
				this.props.history.push('/');
			})
			.catch(() => {
				this.setState({
					errorMessage:
						'It looks like you have entered an incorrect email or password. Please try again.',
					password: '',
				});
			});
	};

	render() {
		return (
			<div className="center auth-view login-view">
				<h1>Sign In</h1>
				<p>
					Enjoy a new and personalized way to listen, <br />
					read, and share your favorite content.
				</p>
				<form className="auth-form" onSubmit={this.submit}>
					<label>
						<input
							autoComplete="username"
							autoFocus={true}
							name="email"
							onChange={(e) => {
								e.preventDefault();
								this.setState({ email: e.target.value });
							}}
							placeholder="Email"
							tabIndex="1"
							type="email"
						/>
					</label>
					<br />
					<label>
						<input
							autoComplete="current-password"
							name="password"
							onChange={(e) => {
								e.preventDefault();
								this.setState({ password: e.target.value });
							}}
							placeholder="Password"
							tabIndex="2"
							type="password"
							value={this.state.password}
						/>
					</label>
					<button
						className="btn primary"
						disabled={!this.isValid()}
						name="sign-in"
						tabIndex="3"
						type="submit"
					>
						Continue
					</button>
					<div className="error">{this.state.errorMessage}</div>
				</form>
				<p className="info">
					New to Winds? <Link to="/create-account">Create an Account</Link>
				</p>
				<p className="info">
					Forget password? <Link to="/forgot-password">Reset Password</Link>
				</p>
			</div>
		);
	}
}

Login.propTypes = {
	dispatch: PropTypes.func.isRequired,
	history: PropTypes.shape({
		push: PropTypes.func.isRequired,
	}),
	signin: PropTypes.func,
};

export default connect()(Login);
