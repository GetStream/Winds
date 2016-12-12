import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { syncHistoryWithStore, routerReducer } from 'react-router-redux'
import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import { browserHistory, Router, Route, IndexRoute, IndexRedirect } from 'react-router'

import thunk from 'redux-thunk'

import syncMiddleware from './middleware/Sync'

import * as reducers from './reducers'

const URLSearchParams = require('url-search-params')

export const store = createStore(
    combineReducers({
        ...reducers,
        routing: routerReducer
    }),
    compose(applyMiddleware(

        store => next => action => Promise.resolve(action).then(next),

        thunk,

        syncMiddleware({
            baseURL: apiBaseUrl,
        }),

    ), window.devToolsExtension ? window.devToolsExtension() : f => f),
)

import * as AppActions from 'actions/App'
import * as TopicActions from 'actions/Topics'

const history = syncHistoryWithStore(browserHistory, store);

import App from './App'
import Home from 'containers/Home'
import Subscriptions from 'containers/Subscriptions'
import SubscriptionLanding from 'containers/Subscriptions/Landing'
import SubscriptionFeed from 'containers/Subscriptions/Feed'
import GetStarted from 'containers/GetStarted'

const loading = store.dispatch(AppActions.init())
    .then(
        () => store.dispatch(AppActions.loaded()),
        () => {

            const qs = new URLSearchParams(window.location.search)
            if (qs.has('auth')) {

                localStorage.setItem('id', qs.get('id'))
                localStorage.setItem('token', qs.get('jwt'))
                localStorage.setItem('email', qs.get('email'))

                if (localStorage.getItem('topics')) {
                    store.dispatch(TopicActions.follow(
                        localStorage.getItem('topics').split(',')
                    ))
                    localStorage.removeItem('topics')
                    window.location.reload()
                } else {
                    window.location.reload()
                }

            } else {

                store.dispatch(AppActions.loaded())
                browserHistory.replace('/app/getting-started')

            }

        }
)

const isReady = (nextState, replace, callback) => {
    loading.then(res => {
        if (nextState.location.pathname == '/app') {
            replace('/app/personalization-feed')
        }
        return callback()
    }, () => {
        replace('/app/getting-started')
        return callback()
    })
}

const renderApp = () => {

    render((
        <Provider store={store}>
            <Router history={history}>
                <Route path="/app/getting-started" component={GetStarted} onEnter={isReady} />
                <Route path="/app" component={App} onEnter={isReady}>
                    <Route path="personalization-feed" component={Home}/>
                    <Route path="subscriptions" component={Subscriptions}>
                        <IndexRoute component={SubscriptionLanding} />
                        <Route path=":id" component={SubscriptionFeed} />
                    </Route>
                </Route>
            </Router>
        </Provider>
    ), document.getElementById('root'))

}

loading.then(
    () => renderApp(),
    (err) => {
        console.warn(err)
        renderApp()
    }
)
