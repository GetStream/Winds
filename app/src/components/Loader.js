import React from 'react';
import PropTypes from 'prop-types';
import Img from 'react-image';

import defaultLoader from '../images/loaders/default.svg';

const Loader = ({ defualtLoader, radius }) =>
	defualtLoader ? (
		<div className="loader">
			<Img src={defaultLoader} />
		</div>
	) : (
		<div className="loader-roll" style={{ width: radius, height: radius }} />
	);

Loader.defaultProps = {
	defualtLoader: true,
	radius: 16,
};

Loader.propTypes = {
	defualtLoader: PropTypes.bool,
	radius: PropTypes.number,
};

export default Loader;
