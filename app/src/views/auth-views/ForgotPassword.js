import { Link, Redirect } from 'react-router-dom';
import React, { Component } from 'react';
import { Img } from 'react-image';
import axios from 'axios';
import backArrow from '../../images/icons/back-arrow.svg';
import lock from '../../images/icons/lock.svg';
import config from '../../config';

class ForgotPassword extends Component {
	constructor(props) {
		super(props);

		this.state = {
			email: null,
			redirect: false,
			valid: false,
		};

		this.validateEmail = this.validateEmail.bind(this);
		this.requestResetPasscode = this.requestResetPasscode.bind(this);
	}

	validateEmail(e) {
		let email = e.target.value.toLowerCase().trim();

		/* eslint-disable */
		const reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

		if (reg.test(email)) {
			this.setState({
				email,
				valid: true,
			});
		} else {
			this.setState({
				email: null,
				valid: false,
			});
		}
	}

	requestResetPasscode(e) {
		e.preventDefault();

		axios
			.post(config.api.url + '/auth/forgot-password', {
				email: this.state.email,
			})
			.then(() => {
				this.setState({
					redirect: true,
				});
			})
			.catch(() => {
				this.setState({
					redirect: true,
				});
			});
	}

	render() {
		const { redirect } = this.state;

		if (redirect) {
			return <Redirect to="/reset-password" />;
		}

		return (
			<div className="center">
				<div className="forgot-password-wrapper">
					<div className="back">
						<Link to={`/login`}>
							<Img src={backArrow} />
							Back
						</Link>
					</div>
					<div className="lock">
						<Img src={lock} />
					</div>
					<div className="cta">
						<p>
							Fill in your email address and we'll send you
							<br />a passcode allowing you to reset your password.
						</p>
					</div>
					<div className="form">
						<form id="forgot-password" onSubmit={this.requestResetPasscode}>
							<label>
								Email <span className="required">Required</span>
								<br />
								<input
									type="email"
									name="email"
									placeholder="Email"
									onChange={this.validateEmail}
								/>
							</label>
							<br />
							<button
								className="btn primary"
								type="submit"
								name="forgot-password"
								disabled={!this.state.email}
							>
								Send Reset
							</button>
						</form>
					</div>
				</div>
			</div>
		);
	}
}

export default ForgotPassword;
