import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'

import moment from 'moment'

import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

import Truncate from 'components/Truncate'
import ImportOPMLDialog from 'components/ImportOPMLDialog'
import Subscription from 'containers/Subscriptions/components/Subscription'

import * as OPMLDialogActions from 'actions/OPMLDialog'
import * as SubscriptionActions from 'actions/Subscriptions'
import * as SiteActions from 'actions/Sites'

@connect(state => ({
    subscriptions: state.Subscriptions,
    sites: state.Sites,
    opmlDialog: state.ImportOPMLDialog,
}))
class Subscriptions extends Component {

    state = {
        unread: 0,
        appending: false,
        importOPMLDialog: false,
    }

    componentWillMount() {

        this.props.dispatch(SubscriptionActions.load())

        let timelineToken = localStorage.getItem('timeline_token')

        if(timelineToken) {
            let notification = realtime.feed(
                'timeline',
                localStorage.getItem('id'),
                localStorage.getItem('timeline_token')
            )

            notification.subscribe((data) => {
                this.setState({ unread: this.state.unread + 1, })
            })
        }

    }

    componentDidMount() {
        window.addEventListener('scroll', this.handleScroll)
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.handleScroll)
    }

    handleMarkAllRead = () => this.props.dispatch(
        SubscriptionActions.markRead()
    )

    handleResetCount = () => {
        this.setState({ unread: 0, })
    }

    handleReload = e => {
        e.preventDefault()
        window.location.reload()
    }

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

            if (offset > (height - 500)) {

                const subs = this.props.subscriptions
                const len  = subs.length

                this.setState({ appending: true, })
                this.props.dispatch(SubscriptionActions.load(subs[len - 1].id))
                    .then(() => this.setState({ appending: false, }))

            }

        }, 100)

    }

    isAllRead = () => this.props.subscriptions.every(sub => sub.read)

    render() {

        return (
            <div className="subscriptions">
                {
                    this.state.unread > 0 ? (
                        <div className="container-fluid realtime-notifications">
                            <div className="banner">
                                <div className="cta text-center" onClick={this.handleReload}>
                                    View {this.state.unread} New Article{this.state.unread === 1 ? '' : 's'}
                                </div>
                                <div className="exit" onClick={this.handleResetCount}>
                                    <svg width="9px" height="9px" viewBox="1176 236 9 9">
                                        <path d="M1181.45,240.03525 L1183.925,237.56025 C1184.121,237.36525 1184.121,237.04825 1183.925,236.85325 L1183.218,236.14625 C1183.023,235.95125 1182.706,235.95125 1182.511,236.14625 L1180.036,238.62125 L1177.561,236.14625 C1177.366,235.95125 1177.049,235.95125 1176.854,236.14625 L1176.147,236.85325 C1175.951,237.04825 1175.951,237.36525 1176.147,237.56025 L1178.622,240.03525 L1176.147,242.51025 C1175.951,242.70525 1175.951,243.02225 1176.147,243.21725 L1176.854,243.92425 C1177.049,244.11925 1177.366,244.11925 1177.561,243.92425 L1180.036,241.44925 L1182.511,243.92425 C1182.706,244.11925 1183.023,244.11925 1183.218,243.92425 L1183.925,243.21725 C1184.121,243.02125 1184.121,242.70525 1183.925,242.51025 L1181.45,240.03525 Z" id="X_1" stroke="none" fillOpacity="0.599999964" fill="#99A9B3" fillRule="evenodd"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    ) : null
                }
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
                                <Link to={`/app/subscriptions/${site.feed.id}`} key={`site-${site.feed.site.id}-${Math.random()}`} onClick={() => { this.trackEngagement(site.feed.site)}}>
                                    <li>
                                        <img src={!!site.feed.site.faviconUrl ? site.feed.site.faviconUrl : '//i.imgur.com/blhZfDe.png'} height="20" width="20" />&nbsp;
                                        <Truncate length={10}>{!!site.feed.site.name ? site.feed.site.name : site.feed.site.siteUrl}</Truncate>
                                    </li>
                                </Link>
                            )}
                            </ul>
                        </div>
                        <div className="open-opml-dialog">
                            <a href="#" onClick={() => this.props.dispatch(OPMLDialogActions.open())}>
                                <svg width="16px" height="16px" viewBox="0 309 16 16">
                                    <g id="ic_file_upload_black_18px" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd" transform="translate(0.000000, 309.000000)">
                                        <g id="Group">
                                            <polygon id="Shape" points="0 0 16 0 16 16 0 16"></polygon>
                                            <path d="M6,10.6666667 L10,10.6666667 L10,6.66666667 L12.6666667,6.66666667 L8,2 L3.33333333,6.66666667 L6,6.66666667 L6,10.6666667 Z M3.33333333,12 L12.6666667,12 L12.6666667,13.3333333 L3.33333333,13.3333333 L3.33333333,12 Z" id="Shape" fill="#99A9B3"></path>
                                        </g>
                                    </g>
                                </svg>
                                Import OPML
                            </a>
                        </div>
                    </div>
                    <div className="col-lg-9 col-md-9 col-sm-12 right">
                        <ReactCSSTransitionGroup
                            transitionName="subscriptions"
                            transitionEnterTimeout={300}
                            transitionLeaveTimeout={300}>
                            {this.props.subscriptions.map((subscription, index) =>
                                <Subscription {...subscription} index={index} key={`subscription-${subscription.id}`} />
                            )}
                        </ReactCSSTransitionGroup>
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
                <ImportOPMLDialog
                    onRequestClose={() => this.props.dispatch(OPMLDialogActions.close())}
                    open={this.props.opmlDialog} />
            </div>
        )

    }
}

require('./styles.scss')

export default Subscriptions
