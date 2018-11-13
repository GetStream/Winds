import React from 'react';
import PropTypes from 'prop-types';

import moment from 'moment';
moment.updateLocale('en', {
	relativeTime: {
		past: '%s Ago',
		s: 's',
		ss: '%ds',
		m: '%dmin',
		mm: '%dmin',
		h: '%dh',
		hh: '%dh',
		d: '%dd',
		dd: '%dd',
		M: '%dm',
		MM: '%dm',
		y: '%dy',
		yy: '%dy',
	},
});

const TimeAgo = (props) => {
	let { timestamp, trim, ...rest } = props;
	return <span {...rest}>{moment.utc(timestamp).fromNow(trim)}</span>;
};

TimeAgo.defaultProps = {
	trim: false,
};

TimeAgo.propTypes = {
	timestamp: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]),
	trim: PropTypes.bool,
};

export default TimeAgo;
