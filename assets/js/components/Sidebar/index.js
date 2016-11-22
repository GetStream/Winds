import React, { Component } from 'react'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'

import Avatar from 'components/Avatar'
import Truncate from 'components/Truncate'

import normalizeUrl from 'normalize-url'

import * as UserActions from 'actions/User'

@connect()
class Sidebar extends Component {

    static defaultProps = {
        open: false,
        sites: [],

        onTopicClick: () => {},
        onRequestClose: () => {},
        onUnsubscribe: () => {},
    }

    state = {
        entering: false,
        animating: false,
        leaving: false,
        profile: false,

        id: localStorage.getItem('id'),
        password: '',
    }

    componentWillReceiveProps(oldProps) {

        if (this.props.open != oldProps.open) {

            clearTimeout(this.$i)

            this.setState({
                entering: (!this.props.open),
                leaving: (this.props.open),
                animating: true,
                profile: false,
            })

            this.$i = setTimeout(() => this.setState({
                entering: false,
                leaving: false,
                animating: false }
            ), 300)

        }

    }

    handleLogout = (e) => {

        e.preventDefault()

        localStorage.clear()
        this.props.dispatch(UserActions.logout())

        window.location.href = '/api/logout'

    }

    handleProfileSubmit = e => {
        e.preventDefault()

        this.setState({ profile: false, })

        this.props.onUserUpdate({
            password: this.state.password,
        })
    }

    handleUnsubscribe = site => {
        this.props.onUnsubscribe(site.feed.id)
    }

    render() {

        let classes = ['sidebar']

        if (this.props.open) classes.push('open')
        if (this.props.animating) classes.push('animating')

        if (this.state.profile) classes.push('profile')

        return (
            <div className={classes.join(' ')}>
                <div className="sidebar-modal" onClick={this.props.onRequestClose} />
                <div className="content">
                    <div className="sidebar-main">
                        <div className="profile">
                            <div className="row">
                                <div className="col-lg-2 col-md-2 col-sm-2 col-xs-2">
                                    <Avatar>{localStorage.getItem('email')}</Avatar>
                                </div>
                                <div className="col-lg-10 col-md-10 col-sm-10 col-xs-10">
                                    <span className="email"><Truncate>{localStorage.getItem('email')}</Truncate></span>
                                </div>
                                <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12" className="edit">
                                    <a href="#" onClick={() => this.setState({ profile: true, })}>Profile Settings</a>
                                    &nbsp;<span className="pipe">&#124;</span>&nbsp;
                                    <a href="#" title="Sign Out" onClick={this.handleLogout}>Sign Out</a>
                                </div>
                            </div>
                        </div>
                        <div className="sidebar-following">
                            <h3>Following</h3>
                            <ul className="list-unstyled">
                                {this.props.topics.map(topic =>
                                    <li
                                        key={`topic-${topic.id}`}
                                        onClick={() => this.props.onTopicClick(topic)}
                                        className={topic.followed == true ? 'active': ''}>
                                        <i className="material-icons">check</i> <Truncate length={15}>{topic.name}</Truncate>
                                    </li>
                                )}
                            </ul>
                        </div>

                        <svg width="225px" height="1px" viewBox="930 420 270 1">
                            <rect id="line" stroke="none" fillOpacity="0.3" fill="#99A9B3" fillRule="evenodd" x="930" y="420" width="270" height="1"></rect>
                        </svg>

                        <div className="sidebar-subscriptions">
                            <h3>Subscriptions</h3>
                            <ul className="list-unstyled">
                                {this.props.sites.map(site => (
                                    <li key={`site-${site.feed.site.id}-${Math.random()}`}>
                                        <a href={normalizeUrl(site.feed.site.siteUrl)} target="_blank" key={`site-${site.feed.site.id}-${Math.random()}`}>
                                            <img src={!!site.feed.site.faviconUrl ? site.feed.site.faviconUrl : 'https://i.imgur.com/blhZfDe.png'} height="20" width="20" />&nbsp;
                                            <Truncate length={15}>{!!site.feed.site.name ? site.feed.site.name : site.feed.site.siteUrl}</Truncate>
                                        </a>
                                        <svg fill="#000000" height="16px" viewBox="0 0 24 24" width="24" onClick={() => this.handleUnsubscribe(site)}>
                                            <path d="M0 0h24v24H0V0z" fill="none"/>
                                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2.46-7.12l1.41-1.41L12 12.59l2.12-2.12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14l-2.13-2.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4z"/>
                                            <path d="M0 0h24v24H0z" fill="none"/>
                                        </svg>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="sidebar-profile">
                        <form onSubmit={this.handleProfileSubmit}>
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    value={this.state.email}
                                    className="form-control"
                                    onChange={e => this.setState({ email: e.target.value, })}
                                    id="email"
                                    placeholder={localStorage.getItem('email')}
                                    disabled="disabled" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <input
                                    type="password"
                                    value={this.state.password}
                                    onChange={e => this.setState({ password: e.target.value, })}
                                    minLength={6}
                                    className="form-control"
                                    id="password"
                                    placeholder="Minimum of 6 characters" />
                            </div>
                            <button type="submit" className="btn">Update</button>
                            <button type="button" className="btn" onClick={() => this.setState({ profile: false, })}>Cancel</button>
                        </form>
                    </div>
                </div>
            </div>
        )
    }
}

require('./styles.scss')

export default Sidebar
