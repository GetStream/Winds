import { Create, ForgotPassword, Login, ResetPassword } from './views/auth-views';
import React, { Component } from 'react';
import AuthedRoute from './AuthedRoute';
import Dashboard from './views/Dashboard';
import Header from './components/Header';
import Player from './components/Player.js';
import PlaylistView from './views/PlaylistView.js';
import PodcastsView from './views/PodcastsView.js';
import RSSFeedsView from './views/RSSFeedsView.js';
import { Router, Switch } from 'react-router-dom';
import UnauthedRoute from './UnauthedRoute';
import analytics from './util/tracking';
import config from './config';
import { createHashHistory, createBrowserHistory } from 'history';
import fetch from './util/fetch';
import AdminView from './views/AdminView';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

var userAgent = navigator.userAgent.toLowerCase();
let isElectron = userAgent.indexOf(' electron/') > -1;

let history;
if (isElectron) {
	history = createHashHistory();
} else {
	history = createBrowserHistory();
}

history.listen(location => {
	return analytics.pageview(`http://localhost:${config.port}`, location.pathname);
});

class AppRouter extends Component {
	componentDidMount() {
		if (localStorage['authedUser']) {
			fetch('GET', `/users/${localStorage['authedUser']}`)
				.then(res => {
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
					<AuthedRoute component={Dashboard} exact path="/" />
					<AuthedRoute component={PlaylistView} path="/playlists/:playlistID" />
					<Switch>
						<AuthedRoute
							component={PodcastsView}
							path="/podcasts/:podcastID"
						/>
						<AuthedRoute component={PodcastsView} path="/podcasts" />
					</Switch>
					<Switch>
						<AuthedRoute component={RSSFeedsView} path="/rss/:rssFeedID" />
						<AuthedRoute component={RSSFeedsView} path="/rss" />
					</Switch>
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
