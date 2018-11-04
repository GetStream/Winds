import React from 'react';
import PropTypes from 'prop-types';

class HighlightMenu extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			init: true,
			w: 0,
			h: 0,
		};
	}

	refCallback = (element) => {
		if (!element) return;
		const bounds = element.getBoundingClientRect();
		this.setState({ w: bounds.width, h: bounds.height, init: false });
	};

	render() {
		if (!this.props.bounds || !this.props.wrapperBounds) return null;

		const bounds = this.props.bounds;
		const wrapperBounds = this.props.wrapperBounds.getBoundingClientRect();

		let top = bounds.top - wrapperBounds.top - this.state.h - 10;
		const reverseArrow = top <= 0;
		if (top <= 0) top = bounds.height - wrapperBounds.top + bounds.top + 10;

		let left = bounds.left + bounds.width / 2 - wrapperBounds.left - this.state.w / 2;
		if (left <= 0) left = 2;
		else if (left + this.state.w > wrapperBounds.width)
			left = wrapperBounds.width - this.state.w - 10;

		return (
			<div
				className={`highlight-menu ${
					this.props.active || this.state.init ? 'active' : ''
				}`}
				ref={this.refCallback}
				style={{
					top,
					left,
				}}
			>
				{this.props.children}
				<span
					className="pointer-arrow"
					style={{
						marginTop: (this.state.h / 2) * (reverseArrow ? -1 : 1),
						transform: reverseArrow ? 'rotate(225deg)' : 'rotate(45deg)',
					}}
				/>
			</div>
		);
	}
}

HighlightMenu.defualtProps = {
	active: false,
};

HighlightMenu.propTypes = {
	children: PropTypes.node,
	active: PropTypes.bool,
	bounds: PropTypes.shape({}),
	wrapperBounds: PropTypes.shape({ getBoundingClientRect: PropTypes.func }),
};

export default HighlightMenu;
