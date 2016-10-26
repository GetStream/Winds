import React, { Component } from 'react'
import { connect } from 'react-redux'

import moment from 'moment'
import normalizeUrl from 'normalize-url'
import Waypoint from 'react-waypoint'

import * as SubscriptionActions from 'actions/Subscriptions'

@connect()
class Subscription extends Component {

    trackEngagement = () =>
        this.props.dispatch(SubscriptionActions.engage(this.props.object.id, this.props.index))

    trackImpression = () =>
        this.props.dispatch(SubscriptionActions.impression(this.props.object.id))

    render() {

        let classes = ['list-inline', 'article']
        if (this.props.read) classes.push('read')

        return(
            <ul className="list-unstyled">
                <Waypoint onEnter={() => {
                    this.trackImpression(this.props.id)
                }} />
                <li className="article">
                    <div className="row">
                        <a
                            href={this.props.articleUrl}
                            target="_blank"
                            title={this.props.title}
                            data-id={this.props.id}
                            data-position={this.props.index}
                            onClick={this.trackEngagement}>
                            <div className="col-lg-12">
                                <ul className={classes.join(' ')}>
                                    <li>
                                        <img src={!!this.props.site.faviconUrl ? this.props.site.faviconUrl : '../../img/app/default-favicon.png'} height="20" width="20" />
                                    </li>
                                    <li>
                                        <a
                                            href={this.props.articleUrl}
                                            target="_blank"
                                            title={this.props.title}
                                            data-id={this.props.id}
                                            data-position={this.props.index}
                                            onClick={this.trackEngagement}>
                                            {this.props.title}
                                        </a>
                                    </li>
                                    <li>
                                        {moment(this.props.time).fromNow()}&nbsp;
                                        <span>from</span>&nbsp;
                                        <a
                                            href={normalizeUrl(this.props.site.siteUrl)}
                                            target="_blank" title={this.props.site.name}>
                                            {this.props.site.name}
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </a>
                    </div>
                </li>
            </ul>
        )

    }

}

export default Subscription
