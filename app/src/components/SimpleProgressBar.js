import PropTypes from 'prop-types';
import React from 'react';
import moment from 'moment';
import momentDuration from 'moment-duration-format'; // eslint-disable-line no-unused-vars

class SimpleProgressBar extends React.Component {
	render() {
		return (
			<div
				className="simple-progress-bar"
				onClick={(e) => {
					this.props.seekTo(e.nativeEvent.offsetX / e.target.clientWidth);
				}}
			>
				<div className="bar">
					<div
						className="progress"
						style={{
							width: `${
								(this.props.currentTime / this.props.duration) * 100
							}%`,
						}}
					/>
					<div className="background" />
				</div>
				<div className="numbers">
					<div className="duration">
						{moment
							.duration(this.props.duration, 'seconds')
							.format('h:mm:ss')}
					</div>
				</div>
			</div>
		);
	}
}

SimpleProgressBar.defaultProps = {
	currentTime: 0,
	duration: 100,
};

SimpleProgressBar.propTypes = {
	currentTime: PropTypes.number,
	duration: PropTypes.number,
	seekTo: PropTypes.func,
};

export default SimpleProgressBar;
