import { Link, withRouter } from 'react-router-dom';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';

import config from '../../config';
import PropTypes from 'prop-types';
import interests from '../../static-data/onboarding-topics.js';
import getPlaceholderImageURL from '../../util/getPlaceholderImageURL.js';
import { getAllData } from '../../api';

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
					done={(interests) => {
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
					done={({ _id, email, jwt }) => {
						window.streamAnalyticsClient.setUser({
							id: _id,
							alias: email,
						});
						localStorage['authedUser'] = _id;
						localStorage['jwt'] = jwt;

						getAllData(this.props.dispatch);
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
	dispatch: PropTypes.func.isRequired,
};

class OnboardingGrid extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			selectedInterests: [],
		};
	}

	toggleInterest(interestName) {
		let foundInterestIndex = this.state.selectedInterests.findIndex(
			(selectedInterest) => {
				return selectedInterest === interestName;
			},
		);

		if (foundInterestIndex !== -1) {
			let newInterests = this.state.selectedInterests.slice();
			newInterests.splice(foundInterestIndex, 1);
			this.setState({ selectedInterests: newInterests });
		} else {
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
					{interests.map((interest) => {
						const isSelected =
							this.state.selectedInterests.findIndex((selectedInterest) => {
								return selectedInterest === interest.name;
							}) !== -1;
						return (
							<div
								className={`hero-card ${isSelected ? 'selected' : ''}`}
								key={interest.name}
								onClick={(e) => {
									e.preventDefault();
									this.toggleInterest(interest.name);
								}}
								style={{
									backgroundImage: `url(${
										interest.image ||
										getPlaceholderImageURL(interest.name)
									})`,
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
					className="btn primary"
					disabled={this.state.selectedInterests.length < 3}
					onClick={(e) => {
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
					onClick={(e) => {
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
	}

	validateForm = () => {
		this.setState({
			valid:
				this.state.username &&
				this.state.email &&
				this.state.password &&
				this.state.name,
		});
	};

	validateName = (e) => {
		const name = e.target.value.trim();
		this.setState({ name: name.length >= 2 ? name : null }, () => {
			this.validateForm();
		});
	};

	validateUsername = (e) => {
		const username = e.target.value.trim();
		this.setState({ username: username.length >= 2 ? username : null }, () => {
			this.validateForm();
		});
	};

	validateEmail = (e) => {
		/* eslint-disable */
		const reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		/* eslint-enable */

		const email = e.target.value.toLowerCase().trim();
		this.setState({ email: reg.test(email) ? email : null }, () => {
			this.validateForm();
		});
	};

	validatePassword = (e) => {
		const password = e.target.value.trim();
		this.setState({ password: password.length >= 2 ? password : null }, () => {
			this.validateForm();
		});
	};

	submit = (username, email, password, name) => {
		if (!this.state.valid || this.state.submitting) return;

		this.setState({ submitting: true });

		axios
			.post(config.api.url + '/auth/signup', {
				username,
				email,
				password,
				name,
				interests: this.props.interests,
			})
			.then((res) => {
				this.setState({ submitting: false });
				this.props.done(res.data);
			})
			.catch((err) => {
				let errorMessage;

				if (
					err.response &&
					err.response.status > 399 &&
					err.response.status < 500 &&
					err.response.data
				) {
					errorMessage = err.response.data.error;
				} else {
					errorMessage =
						'There was an error when attempting to create your account. Please try again later.';
				}

				this.setState({ errorMessage, submitting: false });
			});
	};

	render() {
		return (
			<div className="center auth-view create-account-view">
				<h1>Create Your Free Account</h1>
				<p>
					Enjoy a new and personalized way to listen,
					<br /> read, and share your favorite content.
				</p>

				<form
					className="auth-form"
					onSubmit={(e) => {
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
							placeholder="Password"
							onChange={this.validatePassword}
						/>
					</label>
					<button
						tabIndex="5"
						type="submit"
						className="btn primary"
						disabled={!this.state.valid || this.state.submitting}
					>
						{this.state.submitting ? 'Submitting...' : 'Continue'}
					</button>
					<div className="error">{this.state.errorMessage}</div>
				</form>
				<div className="alt">
					<p>
						Already a Winds User? <Link to="/login">Sign in here</Link>
					</p>
				</div>
			</div>
		);
	}
}

export default withRouter(connect()(Create));
