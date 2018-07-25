import { Create, ForgotPassword, Login, ResetPassword } from './views/auth-views';
import React, { Component } from 'react';
import isElectron from 'is-electron';
import AuthedRoute from './AuthedRoute';
import Dashboard from './views/Dashboard';
import Header from './components/Header';
import Player from './components/Player.js';
import PodcastsView from './views/PodcastsView.js';
import RSSFeedsView from './views/RSSFeedsView.js';
import { Router, Switch, Route } from 'react-router-dom';
import UnauthedRoute from './UnauthedRoute';
import { createHashHistory, createBrowserHistory } from 'history';
import fetch from './util/fetch';
import AdminView from './views/AdminView';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import NotFound from './views/404View';

let history;

if (isElectron) {
	history = createHashHistory();
} else {
	history = createBrowserHistory();
}

class AppRouter extends Component {
	componentDidMount() {
		if (localStorage['authedUser']) {
			fetch('GET', `/users/${localStorage['authedUser']}`)
				.then(res => {
					window.streamAnalyticsClient.setUser({
						id: res.data._id,
						alias: res.data.email,
					});

					this.props.dispatch({
						type: 'UPDATE_USER',
						user: res.data,
					});
				})
				.catch(err => {
					if (err.response.status === 401 || err.response.status === 404) {
						localStorage.clear();
						window.location = '/';
					}
				});
		}
	}
	render() {
		return (
			<Router history={history}>
				<div className="app">
					<AuthedRoute component={Header} redirect={false} showLoader={false} />
					<Switch>
						<AuthedRoute component={Dashboard} exact path="/" />
						<AuthedRoute component={PodcastsView} exact path="/podcasts" />
						<AuthedRoute
							component={PodcastsView}
							path="/podcasts/:podcastID"
						/>
						<AuthedRoute component={RSSFeedsView} exact path="/rss" />
						<AuthedRoute component={RSSFeedsView} path="/rss/:rssFeedID" />
						<AuthedRoute component={AdminView} path="/admin" />
						<UnauthedRoute component={Login} exact path="/login" />
						<UnauthedRoute component={Create} exact path="/create-account" />
						<UnauthedRoute
							component={ForgotPassword}
							exact
							path="/forgot-password"
						/>
						<UnauthedRoute
							component={ResetPassword}
							exact
							path="/reset-password"
						/>
						<Route component={NotFound} />
					</Switch>
					<AuthedRoute component={Player} redirect={false} showLoader={false} />
				</div>
			</Router>
		);
	}
}

AppRouter.propTypes = {
	dispatch: PropTypes.func.isRequired,
};

export default connect()(AppRouter);
