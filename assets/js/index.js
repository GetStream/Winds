import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { syncHistoryWithStore, routerReducer } from 'react-router-redux'
import { createStore, combineReducers, applyMiddleware } from 'redux'
import { browserHistory, Router, Route, IndexRoute, IndexRedirect } from 'react-router'
import thunk from 'redux-thunk'

import syncMiddleware from './middleware/Sync'

import * as reducers from './reducers'

export const store = createStore(
    combineReducers({
        ...reducers,
        routing: routerReducer
    }),
    applyMiddleware(

        store => next => action => Promise.resolve(action).then(next),
        thunk,

        syncMiddleware({
            baseURL: apiBaseUrl,
        }),

    ),
)

import * as AppActions from 'actions/App'

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
            store.dispatch(AppActions.loaded())
            browserHistory.replace('/app/getting-started')
        }
)

const isReady = (nextState, replace, callback) => {
    loading.then(res => {
        if (nextState.location.pathname == '/app') {
            replace('/app/personalization-feed')
        }
        callback()
    }, () => {
        replace('/app/getting-started')
        callback()
    })
}

new Promise(() => {

    const renderApp = () =>
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

    loading.then(
        () => renderApp(),
        () => renderApp()
    )

}).catch(e => console.warn('err:', e))
