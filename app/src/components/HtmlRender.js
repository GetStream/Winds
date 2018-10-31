import React from 'react';
import PropTypes from 'prop-types';
import rangy from 'rangy';
import 'rangy/lib/rangy-classapplier';
import 'rangy/lib/rangy-highlighter';
import { processNodes, htmlparser2 } from 'react-html-parser';

import HighlightMenu from './Notes/HighlightMenu';

class HtmlRender extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			showPopup: false,
		};

		this.wrapper = React.createRef();
	}

	componentDidMount() {
		rangy.init();
		this.highlighter = rangy.createHighlighter();
		this.highlighter.addClassApplier(rangy.createClassApplier('highlight'));
		// this.highlighter.deserialize("");

		this.wrapper.current.addEventListener('mouseup', this.onMouseUp);
	}

	componentWillUnmount() {
		this.wrapper.current.removeEventListener('mouseup', this.onMouseUp);
	}

	onMouseUp = () => {
		const selection = rangy.getSelection();
		const range = selection.rangeCount && selection.nativeSelection.getRangeAt(0);

		if (!range.collapsed && this.wrapper.current !== range.commonAncestorContainer)
			this.setState({ range, showPopup: true });
		else this.setState({ showPopup: false });
	};

	addHighlight = () => {
		this.highlighter.highlightSelection('highlight');
		rangy.getSelection().removeAllRanges();
	};

	removeHighlight = () => {};

	render() {
		const parsed = htmlparser2
			.parseDOM(this.props.content, { decodeEntities: true })
			.filter((n) => !!n.attribs);

		const html = processNodes(parsed);

		return (
			<div className="feed-content" ref={this.wrapper}>
				{html}
				<HighlightMenu
					active={this.state.showPopup}
					addHighlight={this.addHighlight}
					bounds={this.state.range}
					removeHighlight={this.removeHighlight}
					wrapperBounds={this.wrapper.current}
				/>
			</div>
		);
	}
}

HtmlRender.propTypes = {
	content: PropTypes.string,
};

export default HtmlRender;
