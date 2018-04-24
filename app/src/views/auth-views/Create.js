import { Link, withRouter } from 'react-router-dom';
import React, { Component } from 'react';
import Img from 'react-image';
import axios from 'axios';
import config from '../../config';
import logo from '../../images/logos/full.svg';

class Create extends Component {
	constructor(props) {
		super(props);
		this.state = {
			email: null,
			errorMessage: '',
			name: null,
			password: null,
			username: null,
			valid: false,
		};

		this.validateName = this.validateName.bind(this);
		this.validateUsername = this.validateUsername.bind(this);
		this.validateEmail = this.validateEmail.bind(this);
		this.validatePassword = this.validatePassword.bind(this);
	}

	validateForm() {
		if (
			this.state.username &&
			this.state.email &&
			this.state.password &&
			this.state.name
		) {
			this.setState({ valid: true });
		} else {
			this.setState({ valid: false });
		}
	}

	validateName(e) {
		let name = e.target.value.trim();

		if (name.length >= 2) {
			this.setState(
				{
					name: name,
				},
				() => {
					this.validateForm();
				},
			);
		} else {
			this.setState(
				{
					name: null,
				},
				() => {
					this.validateForm();
				},
			);
		}
	}

	validateUsername(e) {
		let username = e.target.value.trim();

		if (username.length >= 2) {
			this.setState(
				{
					username: username,
				},
				() => {
					this.validateForm();
				},
			);
		} else {
			this.setState(
				{
					username: null,
				},
				() => {
					this.validateForm();
				},
			);
		}
	}

	validateEmail(e) {
		let email = e.target.value.toLowerCase().trim();

		/* eslint-disable */
		const reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

		if (reg.test(email)) {
			this.setState(
				{
					email: email,
				},
				() => {
					this.validateForm();
				},
			);
		} else {
			this.setState(
				{
					email: null,
				},
				() => {
					this.validateForm();
				},
			);
		}
	}

	validatePassword(e) {
		let password = e.target.value.trim();

		if (password.length > 4) {
			this.setState(
				{
					password: password,
				},
				() => {
					this.validateForm();
				},
			);
		} else {
			this.setState(
				{
					password: null,
				},
				() => {
					this.validateForm();
				},
			);
		}
	}

	submit(username, email, password, name) {
		axios
			.post(config.api.url + '/auth/signup', {
				username,
				email,
				password,
				name,
			})
			.then(res => {
				localStorage['authedUser'] = res.data._id;
				localStorage['jwt'] = res.data.jwt;
				this.props.history.push('/onboarding');
			})
			.catch(err => {
				let errorMessage;

				if (err.response && err.response.status === 409) {
					errorMessage =
						'The provided username or password already exists. Please try again.';
				} else {
					errorMessage =
						'There was an error when attempting to create your account. Please try again later.';
				}

				this.setState({
					errorMessage,
				});
			});
	}

	render() {
		return (
			<div className="center">
				<div className="create-wrapper">
					<div className="logo">
						<Img src={logo} />
					</div>
					<div className="cta">
						<p>
							Winds is a place to engage with your favorite<br />
							content and with your friends. Join for free.
						</p>
					</div>
					<div className="form">
						<form
							id="sign-in"
							onSubmit={e => {
								e.preventDefault();
								this.submit(
									this.state.username,
									this.state.email,
									this.state.password,
									this.state.name,
								);
							}}
						>
							<label>
								Name<br />
								<input
									autoFocus={true}
									tabIndex="1"
									type="text"
									name="name"
									placeholder="Mr. Coffee"
									onChange={this.validateName}
								/>
							</label>

							<label>
								Username<br />
								<input
									tabIndex="2"
									type="text"
									name="username"
									maxLength="15"
									placeholder="e.g. coffee"
									onChange={this.validateUsername}
								/>
							</label>
							<br />
							<label>
								Email<br />
								<input
									tabIndex="3"
									type="email"
									name="email"
									placeholder="e.g. coffee@example.com"
									onChange={this.validateEmail}
								/>
							</label>
							<br />
							<label>
								Enter your password
								<br />
								<input
									tabIndex="4"
									type="password"
									name="password"
									placeholder="8 characters recommended"
									onChange={this.validatePassword}
								/>
							</label>
							<br />
							<button
								tabIndex="5"
								type="submit"
								name="sign-in"
								className="btn primary"
								disabled={!this.state.valid}
							>
								Continue with my email
							</button>
							<div className="error">{this.state.errorMessage}</div>
							<div className="alt">
								<p>
									Already a Winds User?{' '}
									<Link to={`/login`}>Sign in here</Link>
								</p>
							</div>
						</form>
					</div>
				</div>
			</div>
		);
	}
}

export default withRouter(Create);
