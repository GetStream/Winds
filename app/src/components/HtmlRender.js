import React from 'react';
import PropTypes from 'prop-types';
import rangy from 'rangy';
import 'rangy/lib/rangy-classapplier';
import 'rangy/lib/rangy-highlighter';
import { processNodes, htmlparser2 } from 'react-html-parser';

import HighlightMenu from './Notes/HighlightMenu';
import { getNotes, newNote, deleteNote } from '../api/noteAPI';

class HtmlRender extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			showPopup: false,
			highlighted: false,
			highlights: [],
		};

		this.wrapper = React.createRef();
	}

	componentDidMount() {
		rangy.init();
		this.highlighter = rangy.createHighlighter();
		this.highlighter.addClassApplier(rangy.createClassApplier('highlight'));

		getNotes(this.props.type, this.props.id, ({ data }) => {
			this.setState({ highlights: data });
			const deserialize = data.reduce(
				(acc, h, i) =>
					acc.concat(`|${h.start}$${h.end}$${i}$highlight$feed-content`),
				'type:textContent',
			);
			this.highlighter.deserialize(deserialize);
		});

		this.wrapper.current.addEventListener('mouseup', this.onMouseUp);
	}

	componentWillUnmount() {
		this.wrapper.current.removeEventListener('mouseup', this.onMouseUp);
	}

	onMouseUp = (e) => {
		const selection = rangy.getSelection();
		const range = selection.rangeCount && selection.nativeSelection.getRangeAt(0);

		if (e.target.className === 'highlight') {
			const highlightRange = rangy.createRange();
			highlightRange.selectNodeContents(e.target);

			this.setState({
				range: highlightRange.nativeRange,
				showPopup: true,
				highlighted: true,
			});
		} else if (!range.collapsed) {
			this.setState({ range, showPopup: true, highlighted: false });
		} else {
			this.setState({ showPopup: false });
		}
	};

	addHighlight = () => {
		const highlight = this.highlighter.highlightSelection('highlight', {
			containerElementId: 'feed-content',
		});
		const range = highlight[0].characterRange;
		newNote(
			this.props.type,
			this.props.id,
			range.start,
			range.end,
			null,
			({ data }) =>
				this.setState({
					highlights: [...this.state.highlights, data],
				}),
		);
		this.setState({ showPopup: false });
		rangy.getSelection().removeAllRanges();
	};

	removeHighlight = () => {
		const removed = this.highlighter.unhighlightSelection();
		const range = removed[0].characterRange;
		const highlight = this.state.highlights.find(
			(h) => h.start === range.start && h.end === range.end,
		);
		deleteNote(highlight._id, () =>
			this.setState({
				highlights: this.state.highlights.filter((h) => h._id !== highlight._id),
			}),
		);
		rangy.getSelection().removeAllRanges();
	};

	render() {
		const parsed = htmlparser2
			.parseDOM(this.props.content, { decodeEntities: true })
			.filter((n) => !!n.attribs);
		const html = processNodes(parsed);

		return (
			<div className="feed-content" id="feed-content" ref={this.wrapper}>
				{html}
				<HighlightMenu
					active={this.state.showPopup}
					addHighlight={this.addHighlight}
					bounds={this.state.range}
					close={() => {
						this.setState({ showPopup: false });
						rangy.getSelection().removeAllRanges();
					}}
					highlighted={this.state.highlighted}
					removeHighlight={this.removeHighlight}
					wrapperBounds={this.wrapper.current}
				/>
			</div>
		);
	}
}

HtmlRender.propTypes = {
	content: PropTypes.string,
	type: PropTypes.string.isRequired,
	id: PropTypes.string,
};

export default HtmlRender;
