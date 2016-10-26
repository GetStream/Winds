import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link, browserHistory } from 'react-router'

import Subscription from 'containers/Subscriptions/components/Subscription'

import * as SiteActions from 'actions/Sites'
import * as SubscriptionActions from 'actions/Subscriptions'

class FeedItems extends Component {
    render() {
        return (
            <div className="subscriptions">
                <div className="container-fluid">
                    {this.props.feed.map(f => <Subscription key={`feed-${f.id}`} {...f} />)}
                </div>
            </div>
        )
    }
}

const Header = props => (
    <div className="site-feed-header">
        <Link to="/app/subscriptions">
            <svg width="18px" height="12px" viewBox="30 99 18 12">
                <polygon id="Shape" stroke="none" fill="#99A9B3" fillRule="evenodd" points="48 104 33.83 104 37.41 100.41 36 99 30 105 36 111 37.41 109.59 33.83 106 48 106"></polygon>
            </svg>&nbsp;
            {!!props.site.name ? props.site.name : props.site.siteUrl}
        </Link>
        <div>
            <div className="options">
                <a
                    href="#"
                    className={props.isAllRead ? 'read' : ''}
                    onClick={e => {
                        e.preventDefault()
                        props.onMarkRead()
                    }}>
                    <svg width="11px" height="9px" viewBox="0 2 11 9">
                        <path d="M3.64625,10.857 L0.14625,7.44 C-0.04875,7.252 -0.04875,6.946 0.14625,6.756 L0.85325,6.072 C1.04825,5.884 1.36525,5.884 1.56025,6.072 L4.00025,8.466 L9.43925,3.141 C9.63425,2.953 9.95125,2.953 10.14625,3.141 L10.85325,3.825 C11.04825,4.013 11.04825,4.32 10.85325,4.508 L4.35325,10.859 C4.15825,11.046 3.84225,11.046 3.64625,10.857 L3.64625,10.857 Z" id="Shape" stroke="none" fill="#99A9B3" fillRule="evenodd"></path>
                    </svg>&nbsp;&nbsp;
                    Mark All Read
                </a>

                <a
                    href="#"
                    onClick={e => {
                        e.preventDefault()
                        props.onUnsubscribe()
                    }}>
                    <svg width="10px" height="13px" viewBox="0 0 10 13">
                        <path d="M0.714285714,11.5555556 C0.714285714,12.35 1.35714286,13 2.14285714,13 L7.85714286,13 C8.64285714,13 9.28571429,12.35 9.28571429,11.5555556 L9.28571429,2.88888889 L0.714285714,2.88888889 L0.714285714,11.5555556 L0.714285714,11.5555556 Z M10,0.722222222 L7.5,0.722222222 L6.78571429,0 L3.21428571,0 L2.5,0.722222222 L0,0.722222222 L0,2.16666667 L10,2.16666667 L10,0.722222222 L10,0.722222222 Z" id="Shape" stroke="none" fill="#99A9B3" fillRule="evenodd"></path>
                    </svg>&nbsp;&nbsp;
                    Unsubscribe
                </a>
            </div>
        </div>
    </div>
)

@connect(state => ({ sites: state.Sites, feed: state.Feed,  }))
class Feed extends Component {

    state = {
        appending: false,
        unsubscribed: false,
    }

    componentWillMount() {
        const { dispatch } = this.props
        dispatch(SiteActions.clearArticles())
            .then(() => dispatch(SiteActions.loadArticles(this.props.params.id)))
    }

    isAllRead = () => this.props.feed.every(sub => sub.read)

    handleMarkRead = () => this.props.dispatch(
        SubscriptionActions.markRead(this.props.feed.map(f => f.object.id))
    )

    handleUnsubscribe = () => {
        this.setState({ unsubscribed: true, })
        this.props.dispatch(
            SiteActions.unsubscribe(this.props.params.id)
        )
        browserHistory.replace('/app/subscriptions')
    }

    handleScroll = e => {

        if (this.state.unsubscribed) return clearTimeout(this.$i)

        if (this.$i || this.state.appending) clearTimeout(this.$i)

        this.$i = setTimeout(() => {
            const offset = document.body.scrollTop + window.innerHeight,
                height = document.body.offsetHeight

            if (offset > (height - 100)) {
                const subs = this.props.feed
                const len = subs.length
                this.setState({ appending: true, })
                this.props.dispatch(SiteActions.loadArticles(this.props.params.id, subs[len - 1].id))
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

    render() {

        if (this.state.unsubscribed) return null
        const sites = this.props.sites.filter(s => s.feed.id == this.props.params.id)
        if (sites.length === 0) return <div>Site Not Found</div>

        return (
            <div className="site-feed-list">
                <Header
                    site={sites[0].feed.site}
                    isAllRead={this.isAllRead()}
                    onMarkRead={this.handleMarkRead}
                    onUnsubscribe={this.handleUnsubscribe} />

                <FeedItems feed={this.props.feed} />

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
        )
    }
}

require('./styles.scss')

export default Feed
