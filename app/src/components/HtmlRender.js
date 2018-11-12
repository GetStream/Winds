import React from 'react';
import PropTypes from 'prop-types';
import ReactHtmlParser from 'react-html-parser';
import { connect } from 'react-redux';

import rangy from 'rangy';
import 'rangy/lib/rangy-classapplier';
import 'rangy/lib/rangy-highlighter';
import 'rangy/lib/rangy-selectionsaverestore';

import NoteInput from './Notes/NoteInput';
import HighlightMenu from './Notes/HighlightMenu';
import { newNote, deleteNote, updateNote } from '../api/noteAPI';

import { ReactComponent as NoteIcon } from '../images/icons/note.svg';
import { ReactComponent as NoteGreenIcon } from '../images/icons/note-green.svg';
import { ReactComponent as Highlight } from '../images/icons/highlight.svg';
import { ReactComponent as HighlightRemove } from '../images/icons/highlight-remove.svg';

class HtmlRender extends React.Component {
	constructor(props) {
		super(props);

		this.resetState = {
			isHighlight: false,
			isNote: false,
			highlighted: false,
			noteText: '',
		};

		this.state = {
			...this.resetState,
			html: [],
		};

		this.wrapper = React.createRef();
		this.contentWrapper = React.createRef();
	}

	componentDidMount() {
		rangy.init();
		this.highlighter = rangy.createHighlighter();
		this.highlighter.addClassApplier(rangy.createClassApplier('highlight'));
		this.highlighter.addClassApplier(rangy.createClassApplier('highlight-note'));

		this.setHtml();

		this.contentWrapper.current.addEventListener('mouseup', this.onMouseUp);
		this.contentWrapper.current.addEventListener('click', this.onClick);
	}

	componentDidUpdate(prevProps) {
		if (
			this.props.content !== prevProps.content ||
			this.props.highlights !== prevProps.highlights
		)
			this.setHtml();
	}

	componentWillUnmount() {
		this.contentWrapper.current.removeEventListener('mouseup', this.onMouseUp);
		this.contentWrapper.current.removeEventListener('click', this.onClick);
	}

	setHtml = () => {
		if (this.props.content)
			this.setState({ html: ReactHtmlParser(this.props.content) }, () => {
				const deserialize = this.props.highlights.reduce(
					(acc, h, i) =>
						acc.concat(
							`|${h.start}$${h.end}$${i}$${
								h.text ? 'highlight-note' : 'highlight'
							}$feed-content`,
						),
					'type:textContent',
				);
				console.log(deserialize);
				this.highlighter.deserialize(deserialize);
				this.forceUpdate();
			});
	};

	saveSelection = () => {
		if (this.savedSel) rangy.removeMarkers(this.savedSel);
		this.savedSel = rangy.saveSelection();
	};

	restoreSelection = () => {
		if (this.savedSel) rangy.restoreSelection(this.savedSel);
	};

	close = () => {
		this.setState({ ...this.resetState });
		rangy.getSelection().removeAllRanges();
	};

	getHighlightObj = (element) => {
		let range = this.highlighter.getHighlightForElement(element);
		if (!range) return null;
		range = range.characterRange;
		return this.props.highlights.find(
			(h) => h.start === range.start && h.end === range.end,
		);
	};

	onClick = (e) => {
		const selection = rangy.getSelection().nativeSelection;
		if (this.state.isHighlight && !selection.rangeCount)
			this.setState({ ...this.resetState });

		const className = e.target.getAttribute('class') || '';
		if (className.includes('highlight')) {
			const highlightRange = rangy.createRange();
			highlightRange.selectNode(e.target);
			const bound = highlightRange.nativeRange.getBoundingClientRect();
			this.saveSelection();
			const highlight = this.getHighlightObj(e.target);

			const isNote = className.includes('highlight-note');
			this.setState({
				rangeBounds: {
					top: bound.top,
					left: bound.left,
					height: bound.height,
					width: bound.width,
				},
				isHighlight: !isNote,
				highlighted: !isNote,
				isNote: isNote,
				noteText: highlight ? highlight.text : '',
			});
		}
	};

	onMouseUp = () => {
		const selection = rangy.getSelection().nativeSelection;
		const range = selection.rangeCount && selection.getRangeAt(0);
		let bound = range && range.getBoundingClientRect();

		if (range && range.commonAncestorContainer.className === 'note-input') return;
		else if (range && !range.collapsed) {
			this.saveSelection();

			this.setState({
				rangeBounds: {
					top: bound.top,
					left: bound.left,
					height: bound.height,
					width: bound.width,
				},
				isHighlight: true,
				isNote: false,
				highlighted: false,
				noteText: '',
			});
		} else {
			this.setState({ ...this.resetState });
		}
	};

	convertHighlightToNote = () => {
		const node = rangy.getSelection().focusNode.parentElement;
		const highlight = this.getHighlightObj(node);

		updateNote(this.props.dispatch, highlight._id, this.state.noteText);
		this.setState({ ...this.resetState });
		rangy.getSelection().removeAllRanges();
	};

	addHighlight = () => {
		this.restoreSelection();
		if (this.state.highlighted) return this.convertHighlightToNote();

		const highlight = this.highlighter.highlightSelection(
			this.state.noteText ? 'highlight-note' : 'highlight',
			{ containerElementId: 'feed-content' },
		);
		if (!highlight.length) return this.close();
		const range = highlight[0].characterRange;
		newNote(
			this.props.dispatch,
			this.props.type,
			this.props.id,
			range.start,
			range.end,
			this.state.noteText,
		);
		this.setState({ ...this.resetState });
		rangy.getSelection().removeAllRanges();
	};

	removeHighlight = () => {
		this.restoreSelection();
		const removed = this.highlighter.unhighlightSelection();
		if (!removed.length) return this.close();
		const range = removed[0].characterRange;
		const highlight = this.props.highlights.find(
			(h) => h.start === range.start && h.end === range.end,
		);
		deleteNote(this.props.dispatch, highlight._id);
		this.setState({ ...this.resetState });
		rangy.getSelection().removeAllRanges();
	};

	renderNoteIcons = () => {
		const wrapper = this.contentWrapper.current;
		if (!wrapper) return null;

		const notes = wrapper.getElementsByClassName('highlight-note');
		const wrapperTop = wrapper.getBoundingClientRect().top;

		return Object.values(notes).map((note, i) => {
			const bound = note.getBoundingClientRect();
			return (
				<NoteGreenIcon
					className="highlight-icon"
					key={i}
					style={{
						top: bound.top + bound.height / 2 - wrapperTop - 8,
					}}
				/>
			);
		});
	};

	render() {
		return (
			<div className="feed-content" ref={this.wrapper}>
				<div id="feed-content" ref={this.contentWrapper}>
					{this.state.html}
				</div>

				{this.renderNoteIcons()}

				<HighlightMenu
					active={this.state.isNote}
					bounds={this.state.rangeBounds}
					wrapperBounds={this.wrapper.current}
				>
					<NoteInput
						addNote={this.addHighlight}
						close={this.close}
						deleteNote={this.removeHighlight}
						noteText={this.state.noteText}
						setNoteText={(noteText) => this.setState({ noteText })}
					/>
				</HighlightMenu>

				<HighlightMenu
					active={this.state.isHighlight}
					bounds={this.state.rangeBounds}
					wrapperBounds={this.wrapper.current}
				>
					{this.state.highlighted ? (
						<HighlightRemove onClick={this.removeHighlight} />
					) : (
						<Highlight onClick={this.addHighlight} />
					)}
					<NoteIcon
						onClick={() =>
							this.setState({ isNote: true, isHighlight: false })
						}
					/>
				</HighlightMenu>
			</div>
		);
	}
}

HtmlRender.propTypes = {
	dispatch: PropTypes.func.isRequired,
	content: PropTypes.string,
	type: PropTypes.string.isRequired,
	id: PropTypes.string,
	highlights: PropTypes.array,
};

const mapStateToProps = (state, ownParams) => ({
	highlights: (state.notes && state.notes[ownParams.id]) || [],
});

export default connect(mapStateToProps)(HtmlRender);
