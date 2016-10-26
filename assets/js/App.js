import React, { Component } from 'react'
import { connect } from 'react-redux'
import { browserHistory, Link, withRouter } from 'react-router'

require('./app.scss')

import Header from 'components/Header'
import Footer from 'components/Footer'
import Sidebar from 'components/Sidebar'
import Personalization from 'components/Personalization'

import * as SidebarActions from 'actions/Sidebar'
import * as PersonalizationActions from 'actions/Personalization'
import * as TopicActions from 'actions/Topics'
import * as UserActions from 'actions/User'
import * as LearningActions from 'actions/Learning'
import * as SiteActions from 'actions/Sites'

@connect(state => ({
    app: state.App,
    sidebar: state.Sidebar,
    topics: state.Topics,
    personalization: state.Personalization,
    sites: state.Sites,
    learning: state.Learning,
    user: state.User,
}))
export default class App extends React.Component {

    state = {
        loading: false,
    }

    handleSidebarClose = () => this.props.dispatch(
        SidebarActions.close()
    )

    componentWillReceiveProps(props) {
        if (props.user.loading != this.props.user.loading) {
            this.setState({ loading: props.user.loading, })
        }
    }

    handleTopicClick = topic => {
        const following = this.props.topics.filter(t => t.followed && t.id == topic.id)
        if (following.length > 0) {
            this.props.dispatch(TopicActions.unfollow([topic.id]))
        } else {
            this.props.dispatch(TopicActions.follow([topic.id]))
        }
    }

    handleUserUpdate = user => this.props.dispatch(
        UserActions.update(user)
    )

    handleUnsubscribe = id => this.props.dispatch(
        SiteActions.unsubscribe(id)
    )

    render() {

        const { dispatch } = this.props

        if (this.state.loading) return <div>Loading</div>

        return (
            <div>

                <Sidebar
                    open={this.props.sidebar}
                    topics={this.props.topics}
                    sites={this.props.sites}
                    onUserUpdate={this.handleUserUpdate}
                    onTopicClick={this.handleTopicClick}
                    onUnsubscribe={this.handleUnsubscribe}
                    onRequestClose={this.handleSidebarClose} />

                <Header onPersonalizationClick={() => dispatch(PersonalizationActions.open())} />

                <Personalization
                    open={this.props.personalization.open}
                    onRequestClose={() => dispatch(PersonalizationActions.close())} />

                {this.props.children}

                <Footer />

            </div>
        )
    }

}
