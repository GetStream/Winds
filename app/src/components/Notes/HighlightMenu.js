import React from 'react';
import PropTypes from 'prop-types';

import NoteInput from './NoteInput';

import { ReactComponent as NoteIcon } from '../../images/icons/note.svg';
import { ReactComponent as Highlight } from '../../images/icons/highlight.svg';
import { ReactComponent as HighlightRemove } from '../../images/icons/highlight-remove.svg';

class HighlightMenu extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			note: false,
			init: true,
			w: 0,
			h: 0,
		};
	}

	openNote = (e) => {
		e.stopPropagation();
		e.preventDefault();
		this.setState({ note: true });
	};

	refCallback = (element) => {
		if (!element) return;
		const bounds = element.getBoundingClientRect();
		this.setState({ w: bounds.width, h: bounds.height, init: false });
	};

	render() {
		const bounds = this.props.bounds;
		const wrapperBounds = this.props.wrapperBounds;

		if (!bounds || !wrapperBounds) return null;

		let top = bounds.top - wrapperBounds.top - 10 - this.state.h;
		const reverseArrow = top <= 0;
		top = top > 0 ? top : bounds.height + 10;
		let left = bounds.left + bounds.width / 2 - wrapperBounds.left - this.state.w / 2;
		if (left <= 0) left = 5;
		if (left + this.state.w > wrapperBounds.right)
			left = wrapperBounds.right - this.state.w / 2 - 5;

		return (
			<div
				className={`highlight-menu ${
					this.props.active || this.state.init ? 'active' : ''
				}`}
				ref={this.refCallback}
				style={{ top: `${top}px`, left: `${left}px` }}
			>
				{this.state.note ? (
					<NoteInput />
				) : (
					<>
						{this.props.highlighted ? (
							<HighlightRemove onClick={this.props.highlighting} />
						) : (
							<Highlight onClick={this.props.highlighting} />
						)}
						<NoteIcon onClick={this.openNote} />
					</>
				)}
				<span className={`pointer-down ${reverseArrow && 'reverse'}`} />
			</div>
		);
	}
}

HighlightMenu.defualtProps = {
	active: false,
	highlighted: false,
};

HighlightMenu.propTypes = {
	top: PropTypes.number,
	left: PropTypes.number,
	bounds: PropTypes.shape({}),
	wrapperBounds: PropTypes.shape({}),
	active: PropTypes.bool,
	highlighted: PropTypes.bool,
	highlighting: PropTypes.func,
};

export default HighlightMenu;
