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
		const tags = this.props.tagsFeed;
		const foldersFeed = this.props.foldersFeed;

		return (
			<Panel
				expandSize={2}
				expandable={this.props.recentNotes.length > 2}
				headerText="Recent Notes"
			>
				{recentNotes.length ? (
					recentNotes.map((n) => {
						const isArticle = n.type === 'articles';
						const feedId = isArticle ? n.rss : n.podcast;
						const tagsNo = tags.filter((tag) => tag === n._id).length;
						const link = `/folders/${foldersFeed[feedId]}/${
							isArticle ? 'r' : 'p'
						}/${feedId}/${isArticle ? 'a' : 'e'}/${n._id}`;

						return (
							<Link className="notes-panel" key={n._id} to={link}>
								<div className="title">
									{isArticle ? <RssIcon /> : <PodcastIcon />}
									{n.title}
								</div>
								<div className="numbers">
									<span>
										<NoteIcon /> {n.notes} Note
										{n.notes > 1 && 's'}
									</span>
									<span>
										<PenIcon /> {n.highlights} Highlight
										{n.highlights > 1 && 's'}
									</span>
									<span>
										<TagIcon /> {tagsNo} Tag
										{tagsNo > 1 && 's'}
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
	tagsFeed: [],
	foldersFeed: [],
};

RecentNotesPanel.propTypes = {
	recentNotes: PropTypes.arrayOf(PropTypes.shape({})),
	tagsFeed: PropTypes.arrayOf(PropTypes.string),
	foldersFeed: PropTypes.shape({}),
	dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
	const recentNotes = (state.notesOrder || [])
		.map((id) => state.notes[id])
		.map((note) => {
			const data = note[0].article ? note[0].article : note[0].episode;
			const highlights = note.filter((n) => !n.text).length;
			return { ...data, highlights, notes: note.length - highlights };
		});

	return {
		recentNotes,
		foldersFeed: state.foldersFeed || {},
		tagsFeed: state.tagsFeed || [],
	};
};

export default connect(mapStateToProps)(RecentNotesPanel);
