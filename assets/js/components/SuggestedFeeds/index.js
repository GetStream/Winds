import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'

import normalizeUrl from 'normalize-url'

import Hostname from 'components/Hostname'
import Truncate from 'components/Truncate'

import * as SuggestedFeedsActions from 'actions/SuggestedFeeds'

@connect(state => ({ suggestedFeeds: state.SuggestedFeeds }))
class Suggestion extends Component {

    state = {
        displaySuggestion: true,
    }

    handleRemoveSuggestion = () => {
        this.props.dispatch(SuggestedFeedsActions.remove(this.props.feedId))
    }

    handleFollowSuggestion = (e) => {
        e.preventDefault()
        this.props.dispatch(SuggestedFeedsActions.follow(this.props.feedId))
    }

    render() {

        if (!this.state.displaySuggestion) return null
        if (!this.props.siteUrl) return null

        return(
            <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-xs-2">
                <li>
                    <div className="remove" onClick={this.handleRemoveSuggestion}>
                        <svg width="9px" height="9px" viewBox="147 15 9 9">
                            <path d="M152.45,19.03525 L154.925,16.56025 C155.121,16.36525 155.121,16.04825 154.925,15.85325 L154.218,15.14625 C154.023,14.95125 153.706,14.95125 153.511,15.14625 L151.036,17.62125 L148.561,15.14625 C148.366,14.95125 148.049,14.95125 147.854,15.14625 L147.147,15.85325 C146.951,16.04825 146.951,16.36525 147.147,16.56025 L149.622,19.03525 L147.147,21.51025 C146.951,21.70525 146.951,22.02225 147.147,22.21725 L147.854,22.92425 C148.049,23.11925 148.366,23.11925 148.561,22.92425 L151.036,20.44925 L153.511,22.92425 C153.706,23.11925 154.023,23.11925 154.218,22.92425 L154.925,22.21725 C155.121,22.02125 155.121,21.70525 154.925,21.51025 L152.45,19.03525 Z" id="X_1" stroke="none" fillOpacity="0.599999964" fill="#99A9B3" fillRule="evenodd"></path>
                        </svg>
                    </div>
                    <div className="circle">
                        <div className="favicon">
                            <a href={normalizeUrl(this.props.siteUrl)} target="_blank" title={this.props.siteName}>
                                <img src={this.props.faviconUrl} height="32" width="32" />
                            </a>
                        </div>
                    </div>
                    <div className="bottom">
                        <a href={normalizeUrl(this.props.siteUrl)} target="_blank" className="site-name">
                            <p><Truncate>{this.props.siteName}</Truncate></p>
                        </a>
                        <a href="#" data-id={this.props.feedId} className="follow text-uppercase" onClick={this.handleFollowSuggestion}>
                            Follow
                        </a>
                    </div>
                </li>
            </div>
        )
    }

}

@connect(state => ({ suggestedFeeds: state.SuggestedFeeds }))
class SuggestedFeeds extends Component {

    state = {
        displaySuggestions: true,
    }

    componentWillMount() {
        if (sessionStorage.getItem('suggestionsClosed')) {
            this.setState({
                displaySuggestions: false,
            })
        }
        this.props.dispatch(SuggestedFeedsActions.load())
    }

    handleHideSuggestions = () => {
        this.setState({
            displaySuggestions: false,
        })
        sessionStorage.setItem('suggestionsClosed', 'true')
    }

    render() {

        if (!this.state.displaySuggestions || !this.props.suggestedFeeds.length) return null

        return(
            <div className="suggested-feeds">

                <div className="cta text-uppercase">
                    <span className="title">
                        Suggestions
                        <div className="hide" onClick={this.handleHideSuggestions}>
                            <svg width="9px" height="9px" viewBox="1162 2 9 9">
                                <path d="M1167.45,6.03525 L1169.925,3.56025 C1170.121,3.36525 1170.121,3.04825 1169.925,2.85325 L1169.218,2.14625 C1169.023,1.95125 1168.706,1.95125 1168.511,2.14625 L1166.036,4.62125 L1163.561,2.14625 C1163.366,1.95125 1163.049,1.95125 1162.854,2.14625 L1162.147,2.85325 C1161.951,3.04825 1161.951,3.36525 1162.147,3.56025 L1164.622,6.03525 L1162.147,8.51025 C1161.951,8.70525 1161.951,9.02225 1162.147,9.21725 L1162.854,9.92425 C1163.049,10.11925 1163.366,10.11925 1163.561,9.92425 L1166.036,7.44925 L1168.511,9.92425 C1168.706,10.11925 1169.023,10.11925 1169.218,9.92425 L1169.925,9.21725 C1170.121,9.02125 1170.121,8.70525 1169.925,8.51025 L1167.45,6.03525 Z" id="X_1" stroke="none" fillOpacity="0.599999964" fill="#6D7486" fillRule="evenodd"></path>
                            </svg>
                        </div>
                    </span>
                </div>

                <div className="suggestions">
                    <ul className="list-inline">
                        <div className="row">
                            {[...this.props.suggestedFeeds].slice(0, 6).map(feed =>
                                <Suggestion
                                    feedId={feed.id}
                                    siteName={feed.site.name}
                                    siteUrl={feed.site.siteUrl}
                                    faviconUrl={feed.site.faviconUrl ? feed.site.faviconUrl : 'http://i.imgur.com/blhZfDe.png'}
                                    key={`suggested-feed-${feed.id}`} />
                            )}
                        </div>
                    </ul>
                </div>

            </div>
        )

    }

}

require('./styles.scss')

export default SuggestedFeeds
