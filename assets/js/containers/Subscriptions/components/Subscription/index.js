import React, { Component } from 'react'
import { connect } from 'react-redux'

import moment from 'moment'
import normalizeUrl from 'normalize-url'

import StripEntities from 'components/StripEntities'

import * as SubscriptionActions from 'actions/Subscriptions'
import * as PersonalizationActions from 'actions/Personalization'

@connect()
class Subscription extends Component {

    trackEngagement = () =>
        this.props.dispatch(SubscriptionActions.engage(this.props.object.id, this.props.index))

    handleClick = (e) => {
        e.preventDefault()
        this.trackEngagement().then(() =>
            this.props.dispatch(PersonalizationActions.getStats())
        )

        window.open(this.props.articleUrl, '_blank')
    }

    render() {

        let classes = ['list-inline', 'article']
        if (this.props.read) classes.push('read')

        return(
            <ul className="list-unstyled" onClick={this.handleClick}>
                <li className="article">
                    <div className="row">
                        <div className="col-lg-12">
                            <ul className={classes.join(' ')}>
                                <li>
                                    <img src={!!this.props.site.faviconUrl ? this.props.site.faviconUrl : 'https://i.imgur.com/blhZfDe.png'} height="20" width="20" />
                                </li>
                                <li>
                                    <a
                                        href={this.props.articleUrl}
                                        target="_blank"
                                        title={this.props.title}
                                        data-id={this.props.id}
                                        data-position={this.props.index}>
                                        <StripEntities>{this.props.title}</StripEntities>
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
                                    {
                                        this.props.secondaryUrl ? (
                                            <span>&nbsp;<span className="pipe">|</span>&nbsp;<a href={this.props.secondaryUrl} target="_blank" className="secondary-url">View Comments</a></span>
                                        ) : null
                                    }
                                </li>
                            </ul>
                        </div>
                    </div>
                </li>
            </ul>
        )

    }

}

export default Subscription
