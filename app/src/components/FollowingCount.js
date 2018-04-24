import PropTypes from 'prop-types';
import React from 'react';

class FollowingCount extends React.Component {
	render() {
		return (
			<div>
				<span className="number">{this.props.followingUsers.length}</span>
				<span>{' following'}</span>
			</div>
		);
	}
}

FollowingCount.defaultProps = {
	followingUsers: [],
};

FollowingCount.propTypes = {
	followingUsers: PropTypes.arrayOf(PropTypes.object),
};

export default FollowingCount;
