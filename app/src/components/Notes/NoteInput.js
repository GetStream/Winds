import React from 'react';
import PropTypes from 'prop-types';

import { ReactComponent as NoteIcon } from '../../images/icons/note.svg';

class NoteInput extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			text: props.defVal,
		};
	}

	componentDidUpdate(prevProps) {
		if (prevProps.defVal !== this.props.defVal)
			this.setState({ text: this.props.defVal });
	}

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

		this.props.addNote(this.state.text);
	};

	render() {
		return (
			<form className="note-input" onSubmit={this.handleSubmit}>
				<p>
					<NoteIcon />
					Notes
				</p>
				<textarea
					autoFocus
					className="input-box"
					name="note"
					onChange={(e) => this.setState({ text: e.target.value })}
					placeholder="Enter new note"
					type="text"
					value={this.state.text}
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
	defVal: PropTypes.string,
	close: PropTypes.func,
	deleteNote: PropTypes.func,
	addNote: PropTypes.func,
	restoreSelection: PropTypes.func,
};

export default NoteInput;
