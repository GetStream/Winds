import React from 'react';
import PropTypes from 'prop-types';

import { ReactComponent as NoteIcon } from '../../images/icons/note.svg';

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
		const top = this.props.top - this.state.h;
		const left = this.props.left - this.state.w / 2;

		return (
			<div
				className={`highlight-menu ${
					this.props.active || this.state.init ? 'active' : ''
				}`}
				ref={this.refCallback}
				style={{
					top: `${top > 0 ? top : this.props.boundsHeight + 8}px`,
					left: `${left > 0 ? left : 5}px`,
				}}
			>
				<span className="oval" />
				<NoteIcon />
				<span className="pointer-down" />
			</div>
		);
	}
}

HighlightMenu.defualtProps = {
	active: false,
};

HighlightMenu.propTypes = {
	top: PropTypes.number,
	left: PropTypes.number,
	boundsHeight: PropTypes.number,
	active: PropTypes.bool,
	getSize: PropTypes.func,
};

export default HighlightMenu;
