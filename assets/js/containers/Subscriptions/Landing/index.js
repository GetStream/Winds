import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'

import moment from 'moment'
import Waypoint from 'react-waypoint'

import Subscription from 'containers/Subscriptions/components/Subscription'

import * as SubscriptionActions from 'actions/Subscriptions'
import * as SiteActions from 'actions/Sites'

@connect(state => ({ subscriptions: state.Subscriptions, sites: state.Sites, }))
class Subscriptions extends Component {

    state = {
        appending: false,
    }

    handleMarkAllRead = () => this.props.dispatch(
        SubscriptionActions.markRead()
    )

    trackEngagement = (obj) => {

        obj.foreign_id = `site:${obj.id}`

        client.trackEngagement({
            label: 'siteClick',
            content: obj,
            location: 'subscriptions'
        })

    }

    handleScroll = e => {

        if (this.$i || this.state.appending) clearTimeout(this.$i)

        this.$i = setTimeout(() => {
            const offset = document.body.scrollTop + window.innerHeight,
                height = document.body.offsetHeight

            if (offset > (height - 100)) {
                const subs = this.props.subscriptions
                const len = subs.length
                this.setState({ appending: true, })
                this.props.dispatch(SubscriptionActions.load(subs[len - 1].id))
                    .then(() => this.setState({ appending: false, }))
            }
        }, 200)

    }

    componentDidMount() {
        window.addEventListener('scroll', this.handleScroll)
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.handleScroll)
    }

    isAllRead = () => this.props.subscriptions.every(sub => sub.read)

    render() {

        return (
            <div className="subscriptions">
                <div className="container-fluid">
                    <div className="col-lg-3 col-md-3 col-sm-3 col-xs-3 left hidden-sm-down">
                        <div className="mark-all-read">
                            <a
                                href="#"
                                className={this.isAllRead() ? 'read' : ''}
                                onClick={this.handleMarkAllRead}>Mark All Read</a>
                        </div>
                        <div className="following">
                            <ul className="list-unstyled">
                            {this.props.sites.map((site, index) =>
                                <Link to={`/app/subscriptions/${site.feed.id}`} key={`site-${site.feed.site.id}`} onClick={() => { this.trackEngagement(site.feed.site)}}>
                                    <li>
                                        <img src={!!site.feed.site.faviconUrl ? site.feed.site.faviconUrl : '../img/app/default-favicon.png'} height="20" width="20" />&nbsp;
                                        {!!site.feed.site.name ? site.feed.site.name : site.feed.site.siteUrl}
                                    </li>
                                </Link>
                            )}
                            </ul>
                        </div>
                    </div>
                    <div className="col-lg-9 col-md-9 col-sm-12 right">
                        {this.props.subscriptions.map((subscription, index) =>
                            <Subscription {...subscription} index={index} key={`subscription-${subscription.id}`} />
                        )}
                        {this.state.appending ? <div className="appending-loader">
                            <svg width="35px" height="35px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" className="uil-ring">
                                <rect x="0" y="0" width="100" height="100" fill="none" className="bk"></rect>
                                <defs>
                                    <filter id="uil-ring-shadow" x="-100%" y="-100%" width="300%" height="300%">
                                        <feOffset result="offOut" in="SourceGraphic" dx="0" dy="0"></feOffset>
                                        <feGaussianBlur result="blurOut" in="offOut" stdDeviation="0"></feGaussianBlur>
                                        <feBlend in="SourceGraphic" in2="blurOut" mode="normal"></feBlend>
                                    </filter>
                                </defs>
                                <path d="M10,50c0,0,0,0.5,0.1,1.4c0,0.5,0.1,1,0.2,1.7c0,0.3,0.1,0.7,0.1,1.1c0.1,0.4,0.1,0.8,0.2,1.2c0.2,0.8,0.3,1.8,0.5,2.8 c0.3,1,0.6,2.1,0.9,3.2c0.3,1.1,0.9,2.3,1.4,3.5c0.5,1.2,1.2,2.4,1.8,3.7c0.3,0.6,0.8,1.2,1.2,1.9c0.4,0.6,0.8,1.3,1.3,1.9 c1,1.2,1.9,2.6,3.1,3.7c2.2,2.5,5,4.7,7.9,6.7c3,2,6.5,3.4,10.1,4.6c3.6,1.1,7.5,1.5,11.2,1.6c4-0.1,7.7-0.6,11.3-1.6 c3.6-1.2,7-2.6,10-4.6c3-2,5.8-4.2,7.9-6.7c1.2-1.2,2.1-2.5,3.1-3.7c0.5-0.6,0.9-1.3,1.3-1.9c0.4-0.6,0.8-1.3,1.2-1.9 c0.6-1.3,1.3-2.5,1.8-3.7c0.5-1.2,1-2.4,1.4-3.5c0.3-1.1,0.6-2.2,0.9-3.2c0.2-1,0.4-1.9,0.5-2.8c0.1-0.4,0.1-0.8,0.2-1.2 c0-0.4,0.1-0.7,0.1-1.1c0.1-0.7,0.1-1.2,0.2-1.7C90,50.5,90,50,90,50s0,0.5,0,1.4c0,0.5,0,1,0,1.7c0,0.3,0,0.7,0,1.1 c0,0.4-0.1,0.8-0.1,1.2c-0.1,0.9-0.2,1.8-0.4,2.8c-0.2,1-0.5,2.1-0.7,3.3c-0.3,1.2-0.8,2.4-1.2,3.7c-0.2,0.7-0.5,1.3-0.8,1.9 c-0.3,0.7-0.6,1.3-0.9,2c-0.3,0.7-0.7,1.3-1.1,2c-0.4,0.7-0.7,1.4-1.2,2c-1,1.3-1.9,2.7-3.1,4c-2.2,2.7-5,5-8.1,7.1 c-0.8,0.5-1.6,1-2.4,1.5c-0.8,0.5-1.7,0.9-2.6,1.3L66,87.7l-1.4,0.5c-0.9,0.3-1.8,0.7-2.8,1c-3.8,1.1-7.9,1.7-11.8,1.8L47,90.8 c-1,0-2-0.2-3-0.3l-1.5-0.2l-0.7-0.1L41.1,90c-1-0.3-1.9-0.5-2.9-0.7c-0.9-0.3-1.9-0.7-2.8-1L34,87.7l-1.3-0.6 c-0.9-0.4-1.8-0.8-2.6-1.3c-0.8-0.5-1.6-1-2.4-1.5c-3.1-2.1-5.9-4.5-8.1-7.1c-1.2-1.2-2.1-2.7-3.1-4c-0.5-0.6-0.8-1.4-1.2-2 c-0.4-0.7-0.8-1.3-1.1-2c-0.3-0.7-0.6-1.3-0.9-2c-0.3-0.7-0.6-1.3-0.8-1.9c-0.4-1.3-0.9-2.5-1.2-3.7c-0.3-1.2-0.5-2.3-0.7-3.3 c-0.2-1-0.3-2-0.4-2.8c-0.1-0.4-0.1-0.8-0.1-1.2c0-0.4,0-0.7,0-1.1c0-0.7,0-1.2,0-1.7C10,50.5,10,50,10,50z" fill="#16c98d" filter="url(#uil-ring-shadow)">
                                    <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" repeatCount="indefinite" dur="1s"></animateTransform>
                                </path>
                            </svg>
                        </div> : null}
                    </div>
                </div>
            </div>
        )

    }
}

require('./styles.scss')

export default Subscriptions
