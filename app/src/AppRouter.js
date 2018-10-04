import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Router, Switch, Route } from 'react-router-dom';

import AuthedRoute from './AuthedRoute';
import UnauthedRoute from './UnauthedRoute';
import Dashboard from './views/Dashboard';
import PodcastsView from './views/PodcastsView.js';
import RSSFeedsView from './views/RSSFeedsView.js';
import AdminView from './views/AdminView';
import NotFound from './views/404View';
import Header from './components/Header';
import Player from './components/Player.js';
import { Create, ForgotPassword, Login, ResetPassword } from './views/auth-views';
import { getAllData } from './api';

class AppRouter extends Component {
	componentDidMount() {
		getAllData(this.props.dispatch);
	}

	render() {
		return (
			<Router history={this.props.history}>
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
	history: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({ user: state.user });

export default connect(mapStateToProps)(AppRouter);
