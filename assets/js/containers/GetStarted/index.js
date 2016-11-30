import React, { Component } from 'react'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'

import * as UserActions from 'actions/User'

import Header from 'containers/GetStarted/components/Header'

import Footer from 'components/Footer'
import Dialog from 'components/Dialog'

import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

const FirstChild = props => {
    const childrenArray = React.Children.toArray(props.children)
    return childrenArray[0] || null
}

class Topic extends Component {

    getBackground = () => `url("/img/app/${this.props.name.replace(/\s+/g, '-').toLowerCase()}-bg.jpg")`

    render() {
        return (
            <div className="topic col-lg-4 col-md-6 col-sm-12">
                <input
                    type="checkbox"
                    id={`topic-${this.props.id}`}
                    onChange={e => this.props.onClick(this.props, e.target.checked)} />
                <label htmlFor={`topic-${this.props.id}`} style={{ backgroundImage: this.getBackground() }}>
                    <span>{this.props.name}</span>
                </label>
            </div>
        )
    }
}

@connect(state => ({ topics: state.Topics, }))
class Topics extends Component {
    render() {
        return (
            <main className="topics col-lg-9 col-md-12 padding-strip">
                {this.props.topics.map(topic =>
                    <Topic key={`topic-${topic.id}`} {...topic} onClick={this.props.onSelect} />
                )}
            </main>
        )
    }
}

class ForgotPassword extends Component {

    static defaultProps = {
        onSubmit: () => {},
        sent: false,
    }

    state = {
        email: '',
    }

    handleSubmit = e => {
        e.preventDefault()
        this.props.onSubmit(this.state.email)
    }

    renderButton = () => {

        if (this.props.sent)
            return (
                <button
                    type="submit"
                    className="btn text-uppercase pw-reset">
                    Check Your Email
                </button>
            )

        return (
            <button
                type="submit"
                className="btn text-uppercase reset-pw">
                Reset Password
            </button>
        )

    }

    render() {
        return (
            <div className="container">
                <div className="row">
                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                        <form onSubmit={this.handleSubmit} className="reset-password">
                            <div className="email-container">
                                <input
                                    id="email-input"
                                    type="email"
                                    ref="email"
                                    className={this.props.sent ? 'email-sent' : 'email'}
                                    placeholder="Please enter your email address"
                                    required={true}
                                    value={this.state.email}
                                    onChange={e => this.setState({ email: e.target.value, })} />
                                {this.renderButton()}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        )
    }
}

class CreateAccount extends Component {

    static defaultProps = {
        onCreate: () => {},
        onNeedAccount: () => {},
        onHaveAccount: () => {},
        onSignIn: () => {},
        onResetPassword: () => {},

        create: true,
        error: false,
        loading: false,
    }

    state = {
        email: '',
        password: '',
    }

    componentWillReceiveProps(props) {

        if (props.open != this.props.open) {
            if (props.open) {
                document.getElementById('root').classList.add('creating-account')
            } else {
                document.getElementById('root').classList.remove('creating-account')
            }
        }

        if (props.error != this.props.error && !props.error) {
            this.setState({ password: '', })
            setTimeout(() => {
                this[this.props.create ? '_createPassword' : '_loginPassword'].focus()
            }, 150)
        }

    }

    componentWillUnmount() {
        document.getElementById('root').classList.remove('creating-account')
    }

    handleCreate = e => {
        e.preventDefault()
        this.props.onCreate({
            email: this.state.email,
            password: null,
        })
    }

    handleSignIn = e => {
        e.preventDefault()
        this.props.onSignIn({
            email: this.state.email,
            password: this.state.password,
        })
    }

    handleFacebookSignIn = e => {

        e.preventDefault()

        FB.getLoginStatus(response => {
            console.log(response)
        })

    }

    handleNeedAccount = e => {
        e.preventDefault()
        this.props.onNeedAccount()
    }

    handleHaveAccount = e => {
        e.preventDefault()
        this.props.onHaveAccount()
    }

    getButtonText = () => {

        if (this.props.create) {
            if (this.props.loading) return 'Creating Account'
            return 'Sign Up Now'
        }

        if (this.props.loading) return 'Logging In'
        if (this.props.error) return 'Invalid Email or Password'
        return 'Log In Now'

    }

    renderCreate = () => {
        return (
            <div>
                <header>
                    <h1>Create Your Account</h1>
                    <p>We'll email you your password, which you can change at any time.</p>
                </header>
                <main className="text-center">
                    <form onSubmit={this.handleCreate}>
                        <div>
                            <label>Email Address</label>
                            <input
                                type="email"
                                ref={c => this._createEmail = c}
                                value={this.state.email}
                                onChange={e => this.setState({ email: e.target.value, })}/>
                        </div>
                        <div>
                            <button type="submit">{this.getButtonText()}</button>
                        </div>

                        <div className="sso">
                            <p>Or</p>
                            <a href="#" className="btn facebook">
                                <svg width="9px" height="16px" viewBox="33 22 9 16">
                                    <path d="M42,25 L40,25 C39.7,25 39,25.472 39,26 L39,28 L42,28 L42,31 L39,31 L39,38 L36,38 L36,31 L33,31 L33,28 L36,28 L36,26 C36,23.794 37.961,22 40.062,22 L42,22 L42,25 L42,25 Z" id="Shape" stroke="none" fill="#FFFFFF" fillRule="evenodd"></path>
                                </svg>
                                Facebook Sign Up
                            </a>
                            <a href="#" className="btn google">
                                <svg width="9px" height="16px" viewBox="36 22 9 16">
                                    <path d="M44.5513604,22.0484541 C43.5513604,22.9424541 41.8003604,22.1874541 40.7023604,22.0484541 C35.8513604,21.4294541 34.4323604,26.9054541 37.9673604,29.1024541 C37.0573604,29.5584541 37.1803604,31.8784541 38.1553604,32.2104541 C35.8603604,32.4634541 35.4653604,35.5964541 36.6953604,36.8724541 C38.1913604,38.4264541 42.8153604,38.3234541 44.1673604,36.8724541 C45.1103604,35.8594541 45.2503604,33.7704541 44.4223604,32.8084541 C43.6703604,31.9284541 39.8973604,31.7974541 39.9543604,30.4184541 C39.9953604,29.4534541 41.3623604,29.6034541 42.1923604,29.2214541 C43.7523604,28.4994541 44.4213604,26.3384541 43.8073604,24.6794541 C44.1543604,24.6154541 44.5513604,24.5024541 44.5513604,24.4394541 L44.5513604,22.0484541 L44.5513604,22.0484541 Z M38.5893604,35.2004541 C38.2403604,34.1914541 38.6753604,33.9064541 39.7083604,33.6464541 C40.7413604,33.3864541 42.3353604,33.4504541 42.4423604,34.6014541 C42.6023604,36.3224541 39.0053604,36.3974541 38.5893604,35.2004541 Z M41.4473604,27.0694541 C40.8523604,27.4984541 39.6773604,27.5394541 39.0873604,27.0694541 C37.2693604,23.2354541 43.2683604,23.5104541 41.4473604,27.0694541 L41.4473604,27.0694541 Z" id="Shape" stroke="none" fill="#FFFFFF" fillRule="evenodd"></path>
                                </svg>
                                Google Sign Up
                            </a>
                        </div>

                        <div className="existing-user">
                            <p>Have an account?</p>
                            <a href="#" onClick={this.handleHaveAccount}>Sign In</a>
                        </div>
                    </form>

                </main>
            </div>
        )
    }

    renderSignIn = () => {

        return (
            <div>
                <header>
                    <h1>Your Account</h1>
                    <p>Forgot your password? <a href="#" onClick={this.props.onResetPassword} className="reset-password">Send a new one.</a></p>
                </header>
                <main className="text-center">
                    <form onSubmit={this.handleSignIn}>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                ref={c => this._loginEmail = c}
                                value={this.state.email}
                                onChange={e => this.setState({ email: e.target.value, })}/>
                        </div>
                        <div className="form-group-two">
                            <label>Your Password</label>
                            <input
                                type="password"
                                ref={c => this._loginPassword = c}
                                required={true}
                                minLength={6}
                                value={this.state.password}
                                onChange={e => this.setState({ password: e.target.value, })}/>
                        </div>

                        <button
                            type="submit"
                            disabled={this.props.loading}
                            className={this.getButtonText().toLowerCase().replace(/ /g, '-')}>
                            {this.getButtonText()}
                        </button>

                        <div className="sso">
                            <p>Or</p>
                            <a href="#" className="btn facebook" onClick={this.handleFacebookSignIn}>
                                <svg width="9px" height="16px" viewBox="33 22 9 16">
                                    <path d="M42,25 L40,25 C39.7,25 39,25.472 39,26 L39,28 L42,28 L42,31 L39,31 L39,38 L36,38 L36,31 L33,31 L33,28 L36,28 L36,26 C36,23.794 37.961,22 40.062,22 L42,22 L42,25 L42,25 Z" id="Shape" stroke="none" fill="#FFFFFF" fillRule="evenodd"></path>
                                </svg>
                                Facebook Sign In
                            </a>
                            <a href="#" className="btn google">
                                <svg width="9px" height="16px" viewBox="36 22 9 16">
                                    <path d="M44.5513604,22.0484541 C43.5513604,22.9424541 41.8003604,22.1874541 40.7023604,22.0484541 C35.8513604,21.4294541 34.4323604,26.9054541 37.9673604,29.1024541 C37.0573604,29.5584541 37.1803604,31.8784541 38.1553604,32.2104541 C35.8603604,32.4634541 35.4653604,35.5964541 36.6953604,36.8724541 C38.1913604,38.4264541 42.8153604,38.3234541 44.1673604,36.8724541 C45.1103604,35.8594541 45.2503604,33.7704541 44.4223604,32.8084541 C43.6703604,31.9284541 39.8973604,31.7974541 39.9543604,30.4184541 C39.9953604,29.4534541 41.3623604,29.6034541 42.1923604,29.2214541 C43.7523604,28.4994541 44.4213604,26.3384541 43.8073604,24.6794541 C44.1543604,24.6154541 44.5513604,24.5024541 44.5513604,24.4394541 L44.5513604,22.0484541 L44.5513604,22.0484541 Z M38.5893604,35.2004541 C38.2403604,34.1914541 38.6753604,33.9064541 39.7083604,33.6464541 C40.7413604,33.3864541 42.3353604,33.4504541 42.4423604,34.6014541 C42.6023604,36.3224541 39.0053604,36.3974541 38.5893604,35.2004541 Z M41.4473604,27.0694541 C40.8523604,27.4984541 39.6773604,27.5394541 39.0873604,27.0694541 C37.2693604,23.2354541 43.2683604,23.5104541 41.4473604,27.0694541 L41.4473604,27.0694541 Z" id="Shape" stroke="none" fill="#FFFFFF" fillRule="evenodd"></path>
                                </svg>
                                Google Sign In
                            </a>
                        </div>

                        <div className="existing-user">
                            <p>Need an account?</p>
                            <a href="#" onClick={this.handleNeedAccount}>Sign Up</a>
                        </div>

                    </form>
                </main>
            </div>
        )
    }

    render() {
        return (
            <div className="create-account">
                {this.props.create ? this.renderCreate() : this.renderSignIn()}
            </div>
        )
    }
}

@connect()
class GetStarted extends Component {

    state = {
        selected: [],
        creating: false,
        loadingAccount: false,
        forgotPasswordDialog: false,
        emailSent: false,

        error: false,

        signin: false,
    }

    componentWillMount() {
        if (localStorage.getItem('id') && localStorage.getItem('token') && localStorage.getItem('email')) {
            return browserHistory.replace('/app')
        }
    }

    componentDidUpdate(oldProps, oldState) {
        if (this.state.selected.length != oldState.selected.length && this.state.creating) {
            if (!this.state.signin) this.setState({ creating: false, })
        }
    }

    handleSelected = (topic, checked) => {

        if (!checked) {
            return this.setState({
                selected: this.state.selected.filter(t => t.id != topic.id),
            })
        }

        this.setState({
            selected: [
                ...this.state.selected,
                topic
            ],
        })

    }

    handleCreateAccount = user => {
        this.setState({ creatingAccount: true, loadingAccount: true, })
        this.props.dispatch(UserActions.create({
            ...user,
            topics: this.state.selected.map(t => t.id),
        })).then(() => {

            this.setState({
                creatingAccount: false,
                loadingAccount: false,
            })

            setTimeout(function() {
                browserHistory.replace('/app')
            }, 250)

        }, err => this.setState({ creating: false, creatingAccount: false, loadingAccount: false, }))
    }

    handleSignIn = () => this.setState({ signin: true, creating: true, })
    handleContinue = () => this.setState({ creating: true, signin: false, })

    handleNeedAccount = () => {
        this.setState({ signin: false, })
        this.setState({ creating: (this.state.selected.length >= 3) })
    }

    handleSignInSubmit = data => {

        this.setState({ loadingAccount: true, })

        this.props.dispatch(UserActions.login(data.email, data.password))
            .then(
                () => {
                    this.setState({ loadingAccount: false, })
                    browserHistory.replace('/app')
                },
                err => {
                    this.setState({
                        loadingAccount: false,
                        error: 'Invalid Email or Password.',
                        password: '',
                    })
                    setTimeout(() => this.setState({ error: false, }), 2500)
                }
            )
    }

    handleResetPassword = () => this.setState({ forgotPasswordDialog: true, creating: false, })
    handleResetPasswordSubmit = (email, password) =>
        this.props.dispatch(UserActions.resetPassword(email, password))
            .then(() => this.setState({ emailSent: true, }))

    render() {
        return (
            <div className="getting-started">

                <Dialog
                    onRequestClose={() => this.setState({ forgotPasswordDialog: false, })}
                    open={this.state.forgotPasswordDialog}>
                    <ForgotPassword
                        onSubmit={this.handleResetPasswordSubmit}
                        sent={this.state.emailSent} />
                </Dialog>

                <Header
                    onSignIn={this.handleSignIn}
                    topics={3}
                    selected={this.state.selected.length}
                    onContinue={this.handleContinue} />

                <main className="container-fluid">
                    <aside className="col-lg-3 hidden-md-down">
                        <div className="header text-center">
                            <h1>Personalization<br />Explained</h1>
                        </div>
                        <div className="explainer">
                            <h2>Follow</h2>
                            <p>Personalization starts to work once you have selected at least 3 topics to follow</p>
                            <h2>Engage</h2>
                            <p>Next, we track which content you engage with</p>
                            <h2>Learn</h2>
                            <p>Based on which content you interact with, the experience will become more tailored to your interests.</p>
                        </div>
                        <div className="read-blog">
                            <div className="aligner">
                                <p>Read the technical deep-dive about personalization</p>
                                <a href="http://bit.ly/personalization-winds" target="_blank" className="btn btn-outline-primary">Read More</a>
                            </div>
                        </div>
                    </aside>
                    <Topics onSelect={this.handleSelected} />
                </main>
                <CreateAccount
                    create={!this.state.signin}
                    open={this.state.creating}
                    onNeedAccount={this.handleNeedAccount}
                    error={this.state.error}
                    loading={this.state.loadingAccount}
                    onHaveAccount={() => this.setState({ signin: true, })}
                    onResetPassword={this.handleResetPassword}
                    onSignIn={this.handleSignInSubmit}
                    onCreate={this.handleCreateAccount} />
                <Footer />
            </div>
        )
    }
}

require('./styles.scss')

export default GetStarted
