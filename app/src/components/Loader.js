import defaultLoader from '../images/loaders/default.svg';
import Img from 'react-image';
import React from 'react';

const Loader = () => (
	<div className="loader">
		<Img src={defaultLoader} />
	</div>
);

export default Loader;
