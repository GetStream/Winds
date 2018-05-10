import React from 'react';
import PropTypes from 'prop-types';

import moment from 'moment';

const TimeAgo = props => {
	return <span>{moment.utc(props.timestamp).fromNow(props.trim)}</span>;
};

TimeAgo.defaultProps = {
	trim: false,
};

TimeAgo.propTypes = {
	timestamp: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]),
	trim: PropTypes.bool,
};

export default TimeAgo;
