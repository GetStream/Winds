import React from 'react';
import PropTypes from 'prop-types';

import { ReactComponent as NoteIcon } from '../../images/icons/note.svg';

class NoteInput extends React.Component {
	close = (e) => {
		e.preventDefault();
		e.stopPropagation();

		this.props.close();
	};

	handleDelete = (e) => {
		e.preventDefault();
		e.stopPropagation();

		this.props.deleteNote();
	};

	handleSubmit = (e) => {
		e.preventDefault();
		e.stopPropagation();

		this.props.addNote();
	};

	render() {
		return (
			<form
				className="note-input"
				onKeyDown={(e) => {
					if (e.keyCode === 27) {
						e.stopPropagation();
						this.props.close();
					}
				}}
				onSubmit={this.handleSubmit}
			>
				<p>
					<NoteIcon />
					Notes
				</p>
				<textarea
					autoFocus
					className="input-box"
					name="note"
					onChange={(e) => this.props.setNoteText(e.target.value)}
					placeholder="Enter new note"
					type="text"
					value={this.props.noteText}
				/>

				<div className="buttons">
					<button className="btn primary alt" type="submit">
						SAVE
					</button>
					<button onClick={this.close}>CANCEL</button>
					<button onClick={this.handleDelete}>DELETE</button>
				</div>
			</form>
		);
	}
}

NoteInput.defaultProps = {};

NoteInput.propTypes = {
	noteText: PropTypes.string,
	close: PropTypes.func,
	deleteNote: PropTypes.func,
	addNote: PropTypes.func,
	setNoteText: PropTypes.func,
};

export default NoteInput;
