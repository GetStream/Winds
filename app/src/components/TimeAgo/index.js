import React from 'react';
import PropTypes from 'prop-types';

import moment from 'moment';

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
