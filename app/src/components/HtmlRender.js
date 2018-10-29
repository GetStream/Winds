import React from 'react';
import PropTypes from 'prop-types';
import { processNodes, htmlparser2 } from 'react-html-parser';

import HighlightMenu from './Notes/HighlightMenu';

class HtmlRender extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			showPopup: false,
			selection: {},
		};

		this.wrapper = React.createRef();
	}
	componentDidMount() {
		this.wrapper.current.addEventListener('mouseup', this.select);
	}

	componentWillUnmount() {
		this.wrapper.current.removeEventListener('mouseup', this.select);
	}

	select = () => {
		const wrapper = this.wrapper.current;
		const wrapperBounds = wrapper.getBoundingClientRect();
		const selection = window.getSelection() || document.getSelection();
		const range = selection.rangeCount && selection.getRangeAt(0);

		// collapsed: length of selected text is more than zero
		// commonAncestorContainer: limit the select to parent paragraphs, can not select the whole text
		if (!range.collapsed && range.commonAncestorContainer !== wrapper) {
			const bounds = range.getBoundingClientRect();
			window.s = selection;
			this.setState({
				showPopup: true,
				wrapperBounds,
				bounds,
				selection: {
					range,
					anchorNode: selection.anchorNode,
					anchorOffset: selection.anchorOffset,
					baseNode: selection.baseNode,
					baseOffset: selection.baseOffset,
					extentNode: selection.extentNode,
					extentOffset: selection.extentOffset,
					focusNode: selection.focusNode,
					focusOffset: selection.focusOffset,
				},
			});
		} else this.setState({ showPopup: false });
	};

	highlighting = () => {
		console.log(this.state.selection);
	};

	getAncestorId = (range) => {
		if (!range) return false;

		let ancestor = range.commonAncestorContainer;
		while (ancestor.parentElement !== this.wrapper.current)
			ancestor = ancestor.parentElement;
		return ancestor.getAttribute('id');
	};

	render() {
		const sel = this.state.selection;
		const parsed = htmlparser2.parseDOM(this.props.content, { decodeEntities: true });
		const nodes = parsed.filter((n) => !!n.attribs).map((n) => {
			if (n.attribs.id === this.getAncestorId(sel.range)) {
				if (n.type === 'tag' && n.children.length === 1) {
					const el = n.children[0];
					console.log(el);
					const text = el.data;
					const start =
						sel.anchorOffset > sel.extentOffset
							? sel.extentOffset
							: sel.anchorOffset;
					const end =
						sel.anchorOffset < sel.extentOffset
							? sel.extentOffset
							: sel.anchorOffset;

					const highlight = {
						type: 'tag',
						name: 'span',
						attribs: { class: 'text-highlight' },
						children: [{ type: 'text', data: text.slice(start, end) }],
					};

					n.children = [
						{ type: 'text', data: text.slice(0, start) },
						highlight,
						{ type: 'text', data: text.slice(end) },
					];
				}
			}
			return n;
		});

		let html = processNodes(nodes);
		// html = html.map((el) => {
		// if (el.props.id === this.getAncestorId(sel.range)) {
		// 	const { children, ...rest } = el.props;
		// 	const Component = el.type;

		// 	console.log(children.length);
		// 	let highlightedChildren = [];
		// 	if (children.length === 1) {
		// 		const start =
		// 			sel.anchorOffset > sel.extentOffset
		// 				? sel.extentOffset
		// 				: sel.anchorOffset;
		// 		const end =
		// 			sel.anchorOffset < sel.extentOffset
		// 				? sel.extentOffset
		// 				: sel.anchorOffset;

		// 		const text = children[0];
		// 		highlightedChildren.push(text.slice(0, start));
		// 		highlightedChildren.push(
		// 			<span className="text-highlight">
		// 				{text.slice(start, end)}
		// 			</span>,
		// 		);
		// 		highlightedChildren.push(text.slice(end));
		// 	}

		// 	return (
		// 		<Component key={el.key} {...rest}>
		// 			{highlightedChildren}
		// 		</Component>
		// 	);
		// }
		// 	return el;
		// });

		return (
			<div className="feed-content" ref={this.wrapper}>
				{html}
				<HighlightMenu
					active={this.state.showPopup}
					bounds={this.state.bounds}
					highlighting={this.highlighting}
					wrapperBounds={this.state.wrapperBounds}
				/>
			</div>
		);
	}
}

HtmlRender.propTypes = {
	content: PropTypes.string,
};

export default HtmlRender;
