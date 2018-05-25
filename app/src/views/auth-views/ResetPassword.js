import { Link, Redirect } from "react-router-dom"
import React, { Component } from "react"
import Img from "react-image"
import axios from "axios"
import backArrow from "../../images/icons/back-arrow.svg"
import lock from "../../images/icons/lock.svg"
import config from "../../config"

class ResetPassword extends Component {
    constructor(props) {
        super(props)

        this.state = {
            email: null,
            code: null,
            password: null,
            redirect: false,
            valid: false,
        }

        this.validateEmail = this.validateEmail.bind(this)
        this.validateCode = this.validateCode.bind(this)
        this.validatePassword = this.validatePassword.bind(this)

        this.requestPasswordReset = this.requestPasswordReset.bind(this)
    }

    validateForm() {
        if (this.state.email && this.state.code && this.state.password) {
            this.setState({ valid: true })
        } else {
            this.setState({ valid: false })
        }
        console.log(this.state.valid)
    }

    validateEmail(e) {
        let email = e.target.value.toLowerCase().trim()

        /* eslint-disable */
		const reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

		if (reg.test(email)) {
			this.setState({
				email: email,
			})
		} else {
			this.setState(
				{
					email: null,
				},
				() => {
					this.validateForm()
				},
			)
		}
	}

	validateCode(e) {
		let code = e.target.value.trim()

		if (code.length >= 10) {
			this.setState(
				{
					code,
				},
				() => {
					this.validateForm()
				},
			)
		} else {
			this.setState(
				{
					code: null,
				},
				() => {
					this.validateForm()
				},
			)
		}
	}

	validatePassword(e) {
		let password = e.target.value.trim()

		if (password.length >= 2) {
			this.setState(
				{
					password: password,
				},
				() => {
					this.validateForm()
				},
			)
		} else {
			this.setState(
				{
					password: null,
				},
				() => {
					this.validateForm()
				},
			)
		}
	}

	requestPasswordReset(e) {
		e.preventDefault()

		axios
			.post(config.api.url + '/auth/reset-password', {
				email: this.state.email.toLowerCase(),
				passphrase: this.state.code,
				password: this.state.password,
			})
			.then(() => {
				this.setState({
					redirect: true,
				})
			})
			.catch(err => {
				console.log(err)
			})
	}

	render() {
		const { redirect } = this.state

		if (redirect) {
			return <Redirect to="/login" />
		}

		return (
			<div className="center">
				<div className="reset-password-wrapper">
					<div className="back">
						<Link to={'/forgot-password'}>
							<Img src={backArrow} />
							Back
						</Link>
					</div>
					<div className="lock">
						<Img src={lock} />
					</div>
					<div className="cta">
						<p>
							Enter the code you received and we'll <br />
							reset your password.
						</p>
					</div>
					<div className="form">
						<form id="reset-password" onSubmit={this.requestPasswordReset}>
							<label>
								Email <span className="required">Required</span>
								<br />
								<input
									type="email"
									name="email"
									onChange={this.validateEmail}
								/>
							</label>
							<br />
							<label>
								Code <span className="required">Required</span>
								<br />
								<input
									type="text"
									name="code"
									onChange={this.validateCode}
								/>
							</label>
							<br />
							<label>
								New Password <span className="required">Required</span>
								<br />
								<input
									type="password"
									name="password"
									onChange={this.validatePassword}
								/>
							</label>
							<br />
							<button
								className="btn primary"
								type="submit"
								name="reset-password"
								disabled={!this.state.valid}
							>
								Reset Password
							</button>
						</form>
					</div>
				</div>
			</div>
		)
	}
}

export default ResetPassword
