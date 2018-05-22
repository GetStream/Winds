import { Link, withRouter } from 'react-router-dom';
import React, { Component } from 'react';
import axios from 'axios';
import config from '../../config';
import PropTypes from 'prop-types';
import interests from '../../static-data/onboarding-topics.js';
import getPlaceholderImageURL from '../../util/getPlaceholderImageURL.js';

// convert to 2-stage form - first stage is onboarding, second stage is account details
class Create extends Component {
	constructor(props) {
		super(props);
		this.state = {
			stage: 'onboarding',
		};
	}

	render() {
		if (this.state.stage === 'onboarding') {
			return (
				<OnboardingGrid
					done={interests => {
						this.setState({
							interests,
							stage: 'account-details',
						});
					}}
				/>
			);
		} else {
			return (
				<AccountDetailsForm
					done={(userID, jwt) => {
						localStorage['authedUser'] = userID;
						localStorage['jwt'] = jwt;
						this.props.history.push('/');
					}}
					interests={this.state.interests}
				/>
			);
		}
	}
}

Create.propTypes = {
	history: PropTypes.shape({ push: PropTypes.func.isRequired }),
};

class OnboardingGrid extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			selectedInterests: [],
		};
	}
	toggleInterest(interestName) {
		// look through this.state.selectedInterests - if it's in there, pop and return
		let foundInterestIndex = this.state.selectedInterests.findIndex(
			selectedInterest => {
				return selectedInterest === interestName;
			},
		);

		if (foundInterestIndex !== -1) {
			let newInterests = this.state.selectedInterests.slice();
			newInterests.splice(foundInterestIndex, 1);
			this.setState({
				selectedInterests: newInterests,
			});
		} else {
			// else, push the interest on
			this.setState({
				selectedInterests: [...this.state.selectedInterests, interestName],
			});
		}
	}

	render() {
		return (
			<div className="center auth-view create-account-view">
				<h1>Welcome to Winds!</h1>
				<p>
					Select at least three interests to get started. Have an account?{' '}
					<Link to="/login">Sign in</Link>.
				</p>
				<div className="interests-grid">
					{interests.map((interest, i) => {
						let isSelected =
							this.state.selectedInterests.findIndex(selectedInterest => {
								return selectedInterest === interest.name;
							}) !== -1;
						return (
							<div
								className={`hero-card ${isSelected ? 'selected' : ''}`}
								key={interest.name}
								onClick={e => {
									e.preventDefault();
									this.toggleInterest(interest.name);
								}}
								style={{
									backgroundImage: `url(${interest.image ||
										getPlaceholderImageURL(i.toString())})`,
								}}
							>
								<h1>{interest.name}</h1>
								<p>{interest.subtitle}</p>
								<label>
									{isSelected ? 'Selected' : 'Select interest'}
								</label>
							</div>
						);
					})}
				</div>
				<button
					className={'btn primary'}
					disabled={this.state.selectedInterests.length < 3}
					onClick={e => {
						e.preventDefault();
						this.props.done(this.state.selectedInterests);
					}}
				>
					{this.state.selectedInterests.length >= 3
						? 'Continue'
						: 'Select at least 3 interests to continue'}
				</button>
				<button
					className="btn link"
					onClick={e => {
						e.preventDefault();
						this.props.done();
					}}
				>
					Skip
				</button>
			</div>
		);
	}
}

OnboardingGrid.propTypes = {
	done: PropTypes.func.isRequired,
};

class AccountDetailsForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
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

		if (password.length >= 8) {
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
				interests: this.props.interests,
			})
			.then(res => {
				this.props.done(res.data._id, res.data.jwt);
			})
			.catch(err => {
				let errorMessage;
				if (
					err.response &&
					err.response.status > 399 &&
					err.response.status < 500 &&
					err.response.data
				) {
					errorMessage = err.response.data;
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
			<div className="center auth-view create-account-view">
				<h1>Create Your Free Account</h1>
				<p>
					Enjoy a new and personalized way to listen,<br /> read, and share your
					favorite content.
				</p>

				<form
					className="auth-form"
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
						<input
							autoFocus={true}
							autoComplete="name"
							tabIndex="1"
							type="text"
							name="name"
							placeholder="Your Name"
							onChange={this.validateName}
						/>
					</label>
					<label>
						<input
							tabIndex="2"
							type="text"
							name="username"
							maxLength="15"
							placeholder="Username (alphanumeric)"
							onChange={this.validateUsername}
						/>
					</label>
					<label>
						<input
							autoComplete="email"
							tabIndex="3"
							type="email"
							name="email"
							placeholder="Email"
							onChange={this.validateEmail}
						/>
					</label>
					<label>
						<input
							tabIndex="4"
							autoComplete="current-password"
							type="password"
							name="password"
							placeholder="Password (>= 8 characters)"
							onChange={this.validatePassword}
						/>
					</label>
					<button
						tabIndex="5"
						type="submit"
						className="btn primary"
						disabled={!this.state.valid}
					>
						Continue
					</button>
					<div className="error">{this.state.errorMessage}</div>
				</form>
				<div className="alt">
					<p>
						Already a Winds User? <Link to={`/login`}>Sign in here</Link>
					</p>
				</div>
			</div>
		);
	}
}

export default withRouter(Create);
