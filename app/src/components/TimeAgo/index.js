import React from 'react';
import PropTypes from 'prop-types';

import moment from 'moment';

const TimeAgo = props => {
	return <span>{moment.utc(props.timestamp).fromNow()}</span>;
};

TimeAgo.propTypes = {
	timestamp: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]),
};

export default TimeAgo;
