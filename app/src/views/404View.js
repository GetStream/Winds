import React from 'react';
import PropTypes from 'prop-types';

const NotFound = props => {
	console.log(props);
	return (
		<div className="not-found">
			<h1>404</h1>
			<p>
				Hm, looks like there's nothing here. Maybe{' '}
				<a
					className="link"
					onClick={() => {
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
