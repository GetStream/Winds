import React, { Component } from 'react'
import { connect } from 'react-redux'

import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

import moment from 'moment'
import normalizeUrl from 'normalize-url'

import SocialSharing from 'components/SocialSharing'
import Hostname from 'components/Hostname'
import StripEntities from 'components/StripEntities'
import Summary from 'components/Summary'
import Image from 'components/Image'

import Personalization from 'components/Personalization'
import SuggestedFeeds from 'components/SuggestedFeeds'
import Like from 'components/Like'

import Articles from 'containers/Home/components/Articles'

import * as FeedActions from 'actions/Feeds'
import * as PersonalizationActions from 'actions/Personalization'

@connect(state => ({
    feeds: state.Feeds,
    sidebar: state.Sidebar,
}))
class Home extends Component {

    state = {
        unread: 0,
    }

    trackEngagement = (id, index) => this.props.dispatch(
        FeedActions.engage(id, index)
    )

    componentWillMount() {

        this.props.dispatch(FeedActions.load())

        let timelineToken = localStorage.getItem('timeline_token')
        if (timelineToken) {
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

    componentWillReceiveProps(props) {
        const { dispatch } = this.props
        if (props.sidebar != this.props.sidebar && !props.sidebar) {
            dispatch(FeedActions.clear())
            dispatch(FeedActions.load())
        }
    }

    handleResetCount = () => {
        this.setState({ unread: 0, })
    }

    handleReload = e => {
        e.preventDefault()
        window.location.reload()
    }

    render() {

        if (!this.props.feeds.length) {
            return (
                <div className="appending-loader-main-feed">
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
                </div>
            )
        }

        return (
            <div>
                <div className="container-fluid">
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
                    <div className="container-fluid masonry">
                        <div className="row row-1">
                            <div className="col-lg-3 col-md-12 col-sm-12">
                                <div className="b1">
                                    <h1>Feed Personalization</h1>
                                    <p>Winds is an open source RSS Reader that we built to showcase&nbsp;
                                    <a href="https://getstream.io/personalization/" target="_blank">Personalized Feeds</a>.</p>
                                    <p>We've written a technical deep dive on our blog:</p>
                                </div>
                                <div className="read-blog">
                                    <a href="http://bit.ly/personalization-winds" target="_blank" className="btn btn-outline-primary text-uppercase">HOW IT WORKS &rarr;</a>
                                </div>
                            </div>
                            <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-xs-12 margin-btm" onClick={() => this.trackEngagement(this.props.feeds[0].object.id, 0)}>
                                <a href={this.props.feeds[0].object.articleUrl} target="_blank">
                                    <Image className="b2" src={this.props.feeds[0].object.imageSrc} />
                                </a>
                                <div className="meta">
                                    <div className="title">
                                        <h2>
                                            <a href={this.props.feeds[0].object.articleUrl} target="_blank">
                                                <StripEntities>{this.props.feeds[0].object.title}</StripEntities>
                                            </a>
                                        </h2>
                                    </div>
                                    <div>
                                        <Like id={this.props.feeds[0].feed.id} />
                                        <SocialSharing
                                            url={this.props.feeds[0].object.articleUrl}
                                            title={this.props.feeds[0].object.title}
                                            picture={this.props.feeds[0].object.imageSrc} />
                                        {moment(this.props.feeds[0].object.createdAt).fromNow()}
                                        &nbsp;from&nbsp;
                                        <a href={normalizeUrl(this.props.feeds[0].object.articleUrl)} target="_blank">
                                            {this.props.feeds[0].site.name || this.props.feeds[0].site.siteUrl}
                                        </a>
                                        {
                                            this.props.feeds[0].object.secondaryUrl ? (
                                                <span>&nbsp;<span className="pipe">|</span>&nbsp;<a href={this.props.feeds[0].object.secondaryUrl} target="_blank" className="secondary-url">View Comments</a></span>
                                            ) : null
                                        }
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12 col-xs-12" onClick={() => this.trackEngagement(this.props.feeds[1].object.id, 1)}>
                                <a href={this.props.feeds[1].object.articleUrl} target="_blank">
                                    <Image className="b3" src={this.props.feeds[1].object.imageSrc} />
                                </a>
                                <div className="meta">
                                    <h3>
                                        <a href={this.props.feeds[1].object.articleUrl} target="_blank">
                                            <StripEntities>{this.props.feeds[1].object.title}</StripEntities>
                                        </a>
                                    </h3>
                                    <div>
                                        <Like id={this.props.feeds[1].feed.id} />
                                        <SocialSharing
                                            url={this.props.feeds[1].object.articleUrl}
                                            title={this.props.feeds[1].object.title}
                                            picture={this.props.feeds[1].object.imageSrc} />
                                        {moment(this.props.feeds[1].object.createdAt).fromNow()}
                                        &nbsp;from&nbsp;
                                        <a href={normalizeUrl(this.props.feeds[1].object.articleUrl)} target="_blank">
                                            {this.props.feeds[1].site.name || this.props.feeds[1].site.siteUrl}
                                        </a>
                                        {
                                            this.props.feeds[1].object.secondaryUrl ? (
                                                <span>&nbsp;<span className="pipe">|</span>&nbsp;<a href={this.props.feeds[1].object.secondaryUrl} target="_blank" className="secondary-url">View Comments</a></span>
                                            ) : null
                                        }
                                    </div>
                                    <Summary>{this.props.feeds[1].object.summary}</Summary>
                                </div>
                            </div>
                        </div>

                        <SuggestedFeeds />

                        <div className="row row-2">
                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12" onClick={() => this.trackEngagement(this.props.feeds[2].object.id, 2)}>
                                <a href={this.props.feeds[2].object.articleUrl} target="_blank">
                                    <Image className="b4" src={this.props.feeds[2].object.imageSrc} />
                                </a>
                                <div className="meta">
                                    <h2>
                                        <a href={this.props.feeds[2].object.articleUrl} target="_blank">
                                            <StripEntities>{this.props.feeds[2].object.title}</StripEntities>
                                        </a>
                                    </h2>
                                    <div>
                                        <Like id={this.props.feeds[2].feed.id} />
                                        <SocialSharing
                                            url={this.props.feeds[2].object.articleUrl}
                                            title={this.props.feeds[2].object.title}
                                            picture={this.props.feeds[2].object.imageSrc} />
                                        {moment(this.props.feeds[2].object.createdAt).fromNow()}
                                        &nbsp;from&nbsp;
                                        <a href={normalizeUrl(this.props.feeds[2].object.articleUrl)} target="_blank">
                                            {this.props.feeds[2].site.name || this.props.feeds[2].site.siteUrl}
                                        </a>
                                        {
                                            this.props.feeds[2].object.secondaryUrl ? (
                                                <span>&nbsp;<span className="pipe">|</span>&nbsp;<a href={this.props.feeds[2].object.secondaryUrl} target="_blank" className="secondary-url">View Comments</a></span>
                                            ) : null
                                        }
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12" onClick={() => this.trackEngagement(this.props.feeds[3].object.id, 3)}>
                                <a href={this.props.feeds[3].object.articleUrl} target="_blank">
                                    <Image className="b5" src={this.props.feeds[3].object.imageSrc} />
                                </a>
                                <div className="meta">
                                    <h2>
                                        <a href={this.props.feeds[3].object.articleUrl} target="_blank">
                                            <StripEntities>{this.props.feeds[3].object.title}</StripEntities>
                                        </a>
                                    </h2>
                                    <div>
                                        <Like id={this.props.feeds[3].feed.id} />
                                        <SocialSharing
                                            url={this.props.feeds[3].object.articleUrl}
                                            title={this.props.feeds[3].object.title}
                                            picture={this.props.feeds[3].object.imageSrc} />
                                        {moment(this.props.feeds[3].object.createdAt).fromNow()}
                                        &nbsp;from&nbsp;
                                        <a href={normalizeUrl(this.props.feeds[3].object.articleUrl)} target="_blank">
                                            {this.props.feeds[3].site.name || this.props.feeds[3].site.siteUrl}
                                        </a>
                                        {
                                            this.props.feeds[3].object.secondaryUrl ? (
                                                <span>&nbsp;<span className="pipe">|</span>&nbsp;<a href={this.props.feeds[3].object.secondaryUrl} target="_blank" className="secondary-url">View Comments</a></span>
                                            ) : null
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row row-3">
                            <div
                                className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-xs-12"
                                onClick={() => this.trackEngagement(this.props.feeds[4].object.id, 4)}>
                                <a href={this.props.feeds[4].object.articleUrl} target="_blank">
                                    <Image className="b7" src={this.props.feeds[4].object.imageSrc} />
                                </a>
                                <div className="meta">
                                    <h3>
                                        <a href={this.props.feeds[4].object.articleUrl} target="_blank">
                                            <StripEntities>{this.props.feeds[4].object.title}</StripEntities>
                                        </a>
                                    </h3>
                                    <div>
                                        <Like id={this.props.feeds[4].feed.id} />
                                        <SocialSharing
                                            url={this.props.feeds[4].object.articleUrl}
                                            title={this.props.feeds[4].object.title}
                                            picture={this.props.feeds[4].object.imageSrc} />
                                        {moment(this.props.feeds[4].object.createdAt).fromNow()}
                                        &nbsp;from&nbsp;
                                        <a href={normalizeUrl(this.props.feeds[4].object.articleUrl)} target="_blank">
                                            {this.props.feeds[4].site.name || this.props.feeds[4].site.siteUrl}
                                        </a>
                                        {
                                            this.props.feeds[4].object.secondaryUrl ? (
                                                <span>&nbsp;<span className="pipe">|</span>&nbsp;<a href={this.props.feeds[4].object.secondaryUrl} target="_blank" className="secondary-url">View Comments</a></span>
                                            ) : null
                                        }
                                    </div>
                                    <Summary>{this.props.feeds[4].object.summary}</Summary>
                                    </div>
                                </div>
                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12 col-xs-12" onClick={() => this.trackEngagement(this.props.feeds[5].object.id, 5)}>
                                    <a href={this.props.feeds[5].object.articleUrl} target="_blank">
                                        <Image className="b6" src={this.props.feeds[5].object.imageSrc} />
                                    </a>
                                    <div className="meta">
                                        <h2>
                                            <a href={this.props.feeds[5].object.articleUrl} target="_blank">
                                                <StripEntities>{this.props.feeds[5].object.title}</StripEntities>
                                            </a>
                                        </h2>
                                        <div>
                                            <Like id={this.props.feeds[5].feed.id} />
                                            <SocialSharing url={this.props.feeds[5].object.articleUrl} title={this.props.feeds[5].object.title} picture={this.props.feeds[5].object.imageSrc} />
                                            {moment(this.props.feeds[5].object.createdAt).fromNow()}
                                            &nbsp;from&nbsp;
                                            <a href={normalizeUrl(this.props.feeds[5].object.articleUrl)} target="_blank">
                                                {this.props.feeds[5].site.name || this.props.feeds[5].site.siteUrl}
                                            </a>
                                            {
                                                this.props.feeds[5].object.secondaryUrl ? (
                                                    <span>&nbsp;<span className="pipe">|</span>&nbsp;<a href={this.props.feeds[5].object.secondaryUrl} target="_blank" className="secondary-url">View Comments</a></span>
                                                ) : null
                                            }
                                        </div>
                                    </div>
                                </div>
                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-xs-12" onClick={() => this.trackEngagement(this.props.feeds[6].object.id, 6)}>
                                    <a href={this.props.feeds[6].object.articleUrl} target="_blank">
                                        <Image className="b8" src={this.props.feeds[6].object.imageSrc} />
                                    </a>
                                    <div className="meta">
                                    <h3>
                                        <a href={this.props.feeds[6].object.articleUrl} target="_blank">
                                            <StripEntities>{this.props.feeds[6].object.title}</StripEntities>
                                        </a>
                                    </h3>
                                    <div>
                                        <Like id={this.props.feeds[6].feed.id} />
                                        <SocialSharing
                                            url={this.props.feeds[6].object.articleUrl}
                                            title={this.props.feeds[6].object.title}
                                            picture={this.props.feeds[6].object.imageSrc} />
                                        {moment(this.props.feeds[6].object.createdAt).fromNow()}
                                        &nbsp;from&nbsp;
                                        <a href={normalizeUrl(this.props.feeds[6].object.articleUrl)} target="_blank">
                                            {this.props.feeds[6].site.name || this.props.feeds[6].site.siteUrl}
                                        </a>
                                        {
                                            this.props.feeds[6].object.secondaryUrl ? (
                                                <span>&nbsp;<span className="pipe">|</span>&nbsp;<a href={this.props.feeds[6].object.secondaryUrl} target="_blank" className="secondary-url">View Comments</a></span>
                                            ) : null
                                        }
                                    </div>
                                    <Summary>{this.props.feeds[6].object.summary}</Summary>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
                <Articles />
            </div>
        )
    }
}

require('./styles.scss')

export default Home
