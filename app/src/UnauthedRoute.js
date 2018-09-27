import { Redirect, Route, withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import React from 'react';

const UnauthedRoute = ({ component: Component, ...rest }) => {
	return (
		<Route
			{...rest}
			render={(props) => {
				if (!window.localStorage.getItem('authedUser')) {
					return <Component {...props} />;
				} else if (rest.redirect) {
					return <Redirect to="/" />;
				}
			}}
		/>
	);
};

UnauthedRoute.defaultProps = {
	redirect: true,
};

UnauthedRoute.propTypes = {
	component: PropTypes.func,
};

export default withRouter(UnauthedRoute);
