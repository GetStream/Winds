import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import Panel from '../Panel';
import { ReactComponent as NoteIcon } from '../../images/icons/note.svg';

class RecentNotesPanel extends React.Component {
	render() {
		return (
			<Panel expandable={!!this.props.notes.length} headerText="Recent Notes">
				{this.props.notes.length ? (
					this.props.notes.slice(0, 20).map((note) => (
						<Link key={note._id} to={`/notes/${note._id}`}>
							<div>{note.title}</div>
						</Link>
					))
				) : (
					<div className="no-content">
						<NoteIcon />
						<span>No Notes yet</span>
					</div>
				)}
			</Panel>
		);
	}
}

RecentNotesPanel.defaultProps = {
	notes: [],
};

RecentNotesPanel.propTypes = {
	notes: PropTypes.arrayOf(PropTypes.shape({})),
	dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
	notes: state.notes || [],
});

export default connect(mapStateToProps)(RecentNotesPanel);
