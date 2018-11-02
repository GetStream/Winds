import React from 'react';
import PropTypes from 'prop-types';

import { ReactComponent as NoteIcon } from '../../images/icons/note.svg';

class NoteInput extends React.Component {
	close = (e) => {
		e.preventDefault();
		this.props.close();
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
					defaultValue={this.props.defVal}
					name="note"
					placeholder="Enter new note"
					type="text"
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
};

export default NoteInput;
