import React from 'react';
import PropTypes from 'prop-types';

const NotFound = (props) => {
	return (
		<div className="not-found">
			<h1>404</h1>
			<p>
				Hm, looks like there&#39;s nothing here. Maybe{' '}
				<a
					className="link"
					href="/"
					onClick={(e) => {
						e.preventDefault();
						props.history.goBack();
					}}
				>
					head back and try something else?
				</a>
			</p>
		</div>
	);
};

NotFound.propTypes = {
	history: PropTypes.shape({ goBack: PropTypes.func.isRequired }).isRequired,
};

export default NotFound;
