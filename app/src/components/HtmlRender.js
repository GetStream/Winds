import React from 'react';
import PropTypes from 'prop-types';
import ReactHtmlParser from 'react-html-parser';

import HighlightMenu from './Notes/HighlightMenu';

class HtmlRender extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showPopup: false,
		};

		this.content = React.createRef();
	}
	componentDidMount() {
		this.content.current.addEventListener('mouseup', this.select);
	}

	componentWillUnmount() {
		this.content.current.removeEventListener('mouseup', this.select);
	}

	select = () => {
		const wrapper = this.content.current.getBoundingClientRect();
		const selection = window.getSelection() || document.getSelection();
		const start = selection.anchorNode;
		const end = selection.focusNode;

		if (
			!selection.isCollapsed &&
			(start === end ||
				start.parentElement === end.parentElement ||
				start.parentElement === end.parentElement.parentElement)
		) {
			const bounds = selection.getRangeAt(0).getBoundingClientRect();
			this.setState({
				showPopup: true,
				boundsHeight: bounds.height,
				top: bounds.top - wrapper.top - 10,
				left: bounds.left + bounds.width / 2 - wrapper.left,
			});
		} else this.setState({ showPopup: false });
	};

	render() {
		const html = ReactHtmlParser(this.props.content, {
			preprocessNodes: (nodes) => nodes,
		});

		return (
			<div className="feed-content" ref={this.content}>
				{html}
				<HighlightMenu
					active={this.state.showPopup}
					boundsHeight={this.state.boundsHeight}
					left={this.state.left}
					top={this.state.top}
				/>
			</div>
		);
	}
}

HtmlRender.propTypes = {
	content: PropTypes.string,
};

export default HtmlRender;
