import React, { Component } from 'react'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'

import Avatar from 'components/Avatar'

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

        window.location.href = '/app/getting-started'

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
                                    <span className="email">{localStorage.getItem('email')}</span>
                                </div>
                                <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12" className="edit">
                                    <a href="#" onClick={() => this.setState({ profile: true, })}>Change Password</a>
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
                                        <i className="material-icons">check</i> {topic.name}
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
                                    <li key={`site-${site.feed.site.id}`}>
                                        <a href={normalizeUrl(site.feed.site.siteUrl)} target="_blank" key={`site-${site.feed.site.id}`}>
                                            <img src={!!site.feed.site.faviconUrl ? site.feed.site.faviconUrl : '../img/app/default-favicon.png'} height="20" width="20" />&nbsp;
                                            {!!site.feed.site.name ? site.feed.site.name : site.feed.site.siteUrl}
                                        </a>
                                        <svg width="16px" height="16px" viewBox="255 0 16 16" onClick={() => this.handleUnsubscribe(site)}>
                                            <g id="trash" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd" transform="translate(255.000000, 0.000000)">
                                                <path d="M6.5,7 L5.5,7 C5.224,7 5,7.224 5,7.5 L5,11.5 C5,11.776 5.224,12 5.5,12 L6.5,12 C6.776,12 7,11.776 7,11.5 L7,7.5 C7,7.224 6.776,7 6.5,7 L6.5,7 Z" id="Shape" fill="#99A9B3"></path>
                                                <path d="M10.5,7 L9.5,7 C9.224,7 9,7.224 9,7.5 L9,11.5 C9,11.776 9.224,12 9.5,12 L10.5,12 C10.776,12 11,11.776 11,11.5 L11,7.5 C11,7.224 10.776,7 10.5,7 L10.5,7 Z" id="Shape" fill="#99A9B3"></path>
                                                <path d="M12,1 C12,0.447 11.553,0 11,0 L5,0 C4.447,0 4,0.447 4,1 L4,3 L1,3 C0.447,3 0,3.447 0,4 L0,4 C0,4.553 0.447,5 1,5 L1,5 L1,14 L1,15 C1,15.553 1.447,16 2,16 L14,16 C14.553,16 15,15.553 15,15 L15,5 C15.553,5 16,4.553 16,4 L16,4 C16,3.447 15.553,3 15,3 L12,3 L12,1 L12,1 Z M6,2 L10,2 L10,3 L6,3 L6,2 L6,2 Z M13,14 L3,14 L3,5 L13,5 L13,14 L13,14 Z" id="Shape" fill="#99A9B3"></path>
                                            </g>
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
                                    placeholder="6 character password" />
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
