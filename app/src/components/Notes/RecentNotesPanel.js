import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import Panel from '../Panel';
import { ReactComponent as NoteIcon } from '../../images/icons/note.svg';
import { ReactComponent as RssIcon } from '../../images/icons/rss-bg.svg';
import { ReactComponent as PodcastIcon } from '../../images/icons/podcast.svg';
import { ReactComponent as PenIcon } from '../../images/icons/pen.svg';
import { ReactComponent as TagIcon } from '../../images/icons/tag-simple.svg';

class RecentNotesPanel extends React.Component {
	render() {
		const recentNotes = this.props.recentNotes.slice(0, 20);
		const tags = this.props.tags;

		return (
			<Panel
				expandSize={2}
				expandable={!!this.props.recentNotes.length}
				headerText="Recent Notes"
			>
				{recentNotes.length ? (
					recentNotes.map((n) => {
						const isArticle = n.type === 'articles';
						const link = isArticle
							? `/rss/${n.rss}/articles/${n._id}`
							: `/podcasts/${n.podcast}/episodes/${n._id}`;

						return (
							<Link className="notes-panel" key={n._id} to={link}>
								<div className="title">
									{isArticle ? <RssIcon /> : <PodcastIcon />}
									{n.title}
								</div>
								<div className="numbers">
									<span>
										<NoteIcon /> {n.notes.length} Notes
									</span>
									<span>
										<PenIcon /> {n.highlights.length} Highlights
									</span>
									<span>
										<TagIcon />{' '}
										{tags.filter((tag) => tag === n._id).length} Tags
									</span>
								</div>
							</Link>
						);
					})
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
	recentNotes: [],
	tags: [],
};

RecentNotesPanel.propTypes = {
	recentNotes: PropTypes.arrayOf(PropTypes.shape({})),
	tags: PropTypes.arrayOf(PropTypes.string),
	dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
	const recentNotes = (state.notesOrder || [])
		.map((id) => state.notes[id])
		.map((note) => {
			return note.reduce((acc, note) => {
				if (!acc._id) {
					const data = note.article ? note.article : note.episode;
					acc = { ...data, notes: [], highlights: [] };
				}
				if (note.text) acc.notes.push(note);
				else acc.highlights.push(note);

				return acc;
			}, {});
		});

	return {
		recentNotes,
		tags: (state.tags || []).reduce((acc, tag) => {
			acc.push(...tag.episode.map((e) => e._id), ...tag.article.map((a) => a._id));
			return acc;
		}, []),
	};
};

export default connect(mapStateToProps)(RecentNotesPanel);
