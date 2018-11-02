import React from 'react';
import PropTypes from 'prop-types';

import NoteInput from './NoteInput';

import { ReactComponent as NoteIcon } from '../../images/icons/note.svg';
import { ReactComponent as Highlight } from '../../images/icons/highlight.svg';
import { ReactComponent as HighlightRemove } from '../../images/icons/highlight-remove.svg';

class HighlightMenu extends React.Component {
	constructor(props) {
		super(props);

		this.resetState = {
			note: false,
			init: true,
			w: 0,
			h: 0,
		};

		this.state = { ...this.resetState };
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
		console.log(element);
	};

	close = () => {
		this.setState({ ...this.resetState });
		this.props.close();
	};

	render() {
		if (!this.props.bounds || !this.props.wrapperBounds) return null;

		const bounds = this.props.bounds.getBoundingClientRect();
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
					top: `${top}px`,
					left: `${left}px`,
				}}
			>
				{this.state.note ? (
					<NoteInput close={this.close} />
				) : (
					<>
						{this.props.highlighted ? (
							<HighlightRemove onClick={this.props.removeHighlight} />
						) : (
							<Highlight onClick={this.props.addHighlight} />
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
	bounds: PropTypes.shape({ getBoundingClientRect: PropTypes.func }),
	wrapperBounds: PropTypes.shape({ getBoundingClientRect: PropTypes.func }),
	active: PropTypes.bool,
	highlighted: PropTypes.bool,
	addHighlight: PropTypes.func,
	removeHighlight: PropTypes.func,
	close: PropTypes.func,
};

export default HighlightMenu;
