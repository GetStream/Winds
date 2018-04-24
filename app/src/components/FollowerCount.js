import PropTypes from 'prop-types';
import React from 'react';

class FollowerCount extends React.Component {
	render() {
		return (
			<div>
				<span className="number">{this.props.followerUsers.length}</span>
				<span>
					{this.props.followerUsers.length === 1 ? ' follower' : ' followers'}
				</span>
			</div>
		);
	}
}

FollowerCount.defaultProps = {
	followerUsers: [],
};

FollowerCount.propTypes = {
	followerUsers: PropTypes.arrayOf(PropTypes.object),
};

export default FollowerCount;
