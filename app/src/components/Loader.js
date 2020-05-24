import React from 'react';
import PropTypes from 'prop-types';
import { Img } from 'react-image';

import LoaderIcon from '../images/loaders/default.svg';

const Loader = ({ defaultLoader, radius }) =>
	defaultLoader ? (
		<div className="loader">
			<Img src={LoaderIcon} />
		</div>
	) : (
		<div className="loader-roll" style={{ width: radius, height: radius }} />
	);

Loader.defaultProps = {
	defaultLoader: true,
	radius: 16,
};

Loader.propTypes = {
	defaultLoader: PropTypes.bool,
	radius: PropTypes.number,
};

export default Loader;
