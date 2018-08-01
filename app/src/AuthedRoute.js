import { Redirect, Route, withRouter } from 'react-router-dom';
import Loader from './components/Loader';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import fetch from './util/fetch';

class AuthedRoute extends React.Component {
	componentWillReceiveProps(nextProps) {
		if (!nextProps.user && localStorage['authedUser']) {
			nextProps.getUser();
		}
	}

	render() {
		const { component, ...rest } = this.props;
		const Component = component;

		return (
			<Route
				{...rest}
				render={props => {
					if (!localStorage['authedUser']) {
						if (this.props.redirect) {
							return <Redirect to="/create-account" />;
						} else {
							return <div />;
						}
					} else if (!this.props.user) {
						if (this.props.showLoader) {
							return <Loader />;
						} else {
							return <div />;
						}
					} else {
						return <Component {...props} />;
					}
				}}
			/>
		);
	}
}

AuthedRoute.defaultProps = {
	redirect: true,
	showLoader: true,
};

AuthedRoute.propTypes = {
	component: PropTypes.func,
	getUser: PropTypes.func.isRequired,
	redirect: PropTypes.bool,
	showLoader: PropTypes.bool,
	user: PropTypes.shape({}),
};

const mapStateToProps = state => {
	let user = null;
	if (state.users && state.users[localStorage['authedUser']]) {
		user = state.users[localStorage['authedUser']];
	}
	return {
		user,
	};
};

const mapDispatchToProps = dispatch => {
	return {
		getUser: () => {
			fetch('GET', `/users/${localStorage['authedUser']}`).then(res => {
				dispatch({
					type: 'UPDATE_USER',
					user: res.data,
				});
			});
		},
	};
};

export default withRouter(
	connect(
		mapStateToProps,
		mapDispatchToProps,
	)(AuthedRoute),
);
