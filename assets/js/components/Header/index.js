import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'

import Avatar from 'components/Avatar'

import AddFeedDialog from 'components/AddFeedDialog'

import * as FeedActions from 'actions/Feeds'
import * as SidebarActions from 'actions/Sidebar'
import * as PersonalizationActions from 'actions/Personalization'

@connect(state => ({ user: state.User, personalization: state.Personalization }))
class Header extends Component {

    state = {
        addFeedOpen: false,
        loading: false,
    }

    handleAddFeed = values => {
        this.setState({
            loading: true,
        })

        this.props.dispatch(FeedActions.add(values))
            .then(() => {
                this.setState({
                    addFeedOpen: false,
                    loading: false,
                })
                // TODO: browserHistory
                window.location.reload()
            }).catch(err => {
                this.setState({
                    loading: false,
                })
            })
    }

    handleOpenSidebar = (e) => {
        e.preventDefault()
        this.props.dispatch(SidebarActions.open())
    }

    handlePersonalizationClick = (e) => {
        e.preventDefault()
        this.props.dispatch(PersonalizationActions.toggle())
    }

    render() {

        return (
            <nav className="navbar navbar-fixed-top">
                <div className="navbar-content">
                    <div className="row">
                        <div className="col-lg-8 col-md-8 col-sm-8">
                            <div className="navbar-left">
                                <Link to="/app/personalization-feed" className="no-border">
                                    <svg width="27px" height="29px" viewBox="0 0 27 30">
                                        <g id="App" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                                            <g id="-RSS-1" transform="translate(-30.000000, -45.000000)">
                                                <g id="Page-1" transform="translate(31.000000, 46.000000)">
                                                    <path d="M20.9708,4.0005 C21.0506,2.5514 19.8784,0.1129 16.9708,0.0005 C16.9367,-0.0008 16.9026,0.0008 16.8689,0.0038 C11.2231,0.503 12.1909,8.0361 16.9708,8.0005 C23.2379,7.9538 26.9708,8.0005 26.9708,8.0005" id="Stroke-6" stroke="#16C98D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                                                    <path d="M7.9708,10.0005 C8.0506,8.5514 6.8784,6.1129 3.9708,6.0005 C3.9367,5.9992 3.9026,6.0008 3.8689,6.0038 C-1.7769,6.503 -0.8091,14.0361 3.9708,14.0005 C10.2379,13.9538 26.9708,14.0005 26.9708,14.0005" id="Stroke-7" stroke="#16C98D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                                                    <path d="M12.9708,24.0001 C13.0506,25.4492 11.8784,27.8877 8.9708,28.0001 C8.9367,28.0015 8.9026,27.9998 8.8689,27.9968 C3.2231,27.4976 4.1909,19.9646 8.9708,20.0001 C15.2379,20.0468 26.9708,20.0001 26.9708,20.0001" id="Stroke-8" stroke="#16C98D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                                                </g>
                                            </g>
                                        </g>
                                    </svg>
                                </Link>
                                <Link to="/app/personalization-feed" activeClassName="active">
                                    Personalized Feed
                                </Link>
                                <Link to="/app/subscriptions" activeClassName="active">
                                    Subscriptions
                                </Link>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-4 col-sm-4 ">
                            <div className="navbar-right">
                                <a href="#" className="icon hidden-xs-down" onClick={this.handlePersonalizationClick}>
                                    <svg width="14px" height="16px" viewBox="1085 22 14 16" className="personalization-icon">
                                        <g id="personalization-icon" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd" transform="translate(1085.000000, 22.000000)">
                                            <circle className="oval" fill="#99A9B3" cx="12" cy="5" r="2"></circle>
                                            <circle className="oval" fill="#99A9B3" cx="2" cy="5" r="2"></circle>
                                            <circle className="oval" fill="#99A9B3" cx="7" cy="14" r="2"></circle>
                                            <circle className="oval" fill="#99A9B3" cx="12" cy="11" r="2"></circle>
                                            <circle className="oval" fill="#99A9B3" cx="2" cy="11" r="2"></circle>
                                            <circle className="oval" fill="#99A9B3" cx="7" cy="2" r="2"></circle>
                                        </g>
                                    </svg>
                                </a>
                                <a href="#" className="icon hidden-xs-down" onClick={() => this.setState({ addFeedOpen: true, })}>
                                    <svg width="14px" height="14px" viewBox="1356 21 14 14" className="rss-add-icon">
                                        <polygon id="Shape" stroke="none" fill="#99A9B3" fillRule="evenodd" points="1370 29 1364 29 1364 35 1362 35 1362 29 1356 29 1356 27 1362 27 1362 21 1364 21 1364 27 1370 27"></polygon>
                                    </svg>
                                </a>
                                <a href="#" className="icon" onClick={this.handleOpenSidebar}>
                                    {this.props.user && this.props.user.id
                                        ? <Avatar>{this.props.user.email}</Avatar>
                                        : null}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="clearfix"></div>

                <AddFeedDialog
                    open={this.state.addFeedOpen}
                    onSubmit={this.handleAddFeed}
                    loading={this.state.loading}
                    onRequestClose={() => this.setState({ addFeedOpen: false, })} />
            </nav>

        )
    }
}

require('./styles.scss')

export default Header
