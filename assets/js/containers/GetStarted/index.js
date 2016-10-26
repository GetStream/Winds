import React, { Component } from 'react'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'

import * as UserActions from 'actions/User'

import Header from 'containers/GetStarted/components/Header'

import Footer from 'components/Footer'

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

class CreateAccount extends Component {

    static defaultProps = {
        onCreate: () => {},
        onNeedAccount: () => {},
        onHaveAccount: () => {},
        onSignIn: () => {},
        onResetPassword: () => {},

        create: true,
        error: false,
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

    handleNeedAccount = e => {
        e.preventDefault()
        this.props.onNeedAccount()
    }

    handleHaveAccount = e => {
        e.preventDefault()
        this.props.onHaveAccount()
    }

    handleResetPassword = e => {
        e.preventDefault()
        const email = prompt('Please enter your email address.')
        if (email != '') {
            this.props.onResetPassword(email, '')
        }
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
                                value={this.state.email}
                                onChange={e => this.setState({ email: e.target.value, })}/>
                        </div>
                        <div>
                            <button type="submit">Sign Up Now</button>
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
                    <p>Forgot your password? <a href="#" onClick={this.handleResetPassword} className="reset-password">Send a new one.</a></p>
                </header>
                <main className="text-center">
                    <form onSubmit={this.handleSignIn}>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                value={this.state.email}
                                onChange={e => this.setState({ email: e.target.value, })}/>
                        </div>
                        <div className="form-group-two">
                            <label>Your Password</label>
                            <input
                                type="password"
                                required={true}
                                minLength={6}
                                value={this.state.password}
                                onChange={e => this.setState({ password: e.target.value, })}/>
                        </div>
                        <button type="submit">Log In Now</button>
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

        error: false,

        signin: false,
    }

    componentWillMount() {
        if (localStorage.getItem('id') && localStorage.getItem('token') && localStorage.getItem('email')) {
            return browserHistory.replace('/app')
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
        this.props.dispatch(UserActions.create({
            ...user,
            topics: this.state.selected.map(t => t.id),
        })).then(() => {
            setTimeout(function() {
                browserHistory.replace('/app')
            }, 750)
        }, err => this.setState({ creating: false, }))
    }

    componentDidUpdate(oldProps, oldState) {
        if (this.state.selected.length != oldState.selected.length && this.state.creating) {
            if (!this.state.signin) this.setState({ creating: false, })
        }
    }

    handleSignIn = () => this.setState({ signin: true, creating: true, })
    handleContinue = () => this.setState({ creating: true, signin: false, })

    handleNeedAccount = () => {
        this.setState({ signin: false, })
        this.setState({ creating: (this.state.selected.length >= 3) })
    }

    handleSignInSubmit = data =>
        this.props.dispatch(UserActions.login(data.email, data.password))
            .then(
                () => browserHistory.replace('/app'),
                err => alert('Invalid email or password.')
            )

    handleResetPassword = (email, password) =>
        this.props.dispatch(UserActions.resetPassword(email, password))

    render() {
        return (
            <div className="getting-started">
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
                                <a href="http://blog.getstream.io/winds-rss-reader-with-personalization" target="_blank" className="btn btn-outline-primary">Read More</a>
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
