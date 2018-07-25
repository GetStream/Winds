import PropTypes from 'prop-types';
import React from 'react';

class Drawer extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		if (this.props.isOpen) {
			return (
				<div>
					<div className="drawer">
						<div className="drawer-container">
							<div className={this.props.className}>
								{this.props.children}
							</div>
						</div>
					</div>
					<div
						className="drawer-click-catcher"
						onClick={this.props.closeDrawer}
					/>
				</div>
			);
		} else {
			return null;
		}
	}
}

Drawer.defaultProps = {
	className: '',
	isOpen: false,
};

Drawer.propTypes = {
	children: PropTypes.oneOfType([PropTypes.node, PropTypes.arrayOf(PropTypes.node)]),
	className: PropTypes.string,
	closeDrawer: PropTypes.func.isRequired,
	isOpen: PropTypes.bool,
};

export default Drawer;
