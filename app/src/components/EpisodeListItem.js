import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import FeedListItem from './FeedListItem';
import { pinEpisode, unpinEpisode } from '../util/pins';

class EpisodeListItem extends React.Component {
	playOrPauseEpisode = () => {
		if (this.props.inPlayer && this.props.player.playing) this.props.pauseEpisode();
		else if (this.props.inPlayer) this.props.resumeEpisode();
		else this.props.playEpisode(this.props._id, this.props.podcast._id);
	};

	render() {
		const folderView = this.props.location.pathname.includes('folders');
		const tagView = this.props.location.pathname.includes('tags');
		const id = this.props._id;
		const podcastId = this.props.podcast._id;
		const folderId = this.props.foldersFeed[podcastId];
		const link =
			folderView || tagView
				? `/folders/${folderId}/p/${podcastId}/e/${id}`
				: `/podcasts/${podcastId}/episodes/${id}`;

		const note = this.props.notes[id] || [];
		const highlightsNo = note.filter((h) => !h.text).length;
		const notesNo = note.length - highlightsNo;
		const tagsNo = this.props.tagsFeed.filter((tag) => tag === id).length;

		return (
			<FeedListItem
				{...this.props}
				feedTitle={this.props.podcast.title}
				highlights={highlightsNo}
				inPlayer={this.props.inPlayer}
				isPlaying={this.props.player.playing}
				link={link}
				notes={notesNo}
				onNavigation={this.props.onNavigation}
				pin={() => pinEpisode(id, this.props.dispatch)}
				playOrPauseEpisode={this.playOrPauseEpisode}
				playable={true}
				tags={tagsNo}
				unpin={() => unpinEpisode(this.props.pinID, id, this.props.dispatch)}
			/>
		);
	}
}

EpisodeListItem.defaultProps = {
	images: {},
	pinID: '',
	recent: false,
};

EpisodeListItem.propTypes = {
	_id: PropTypes.string,
	dispatch: PropTypes.func.isRequired,
	pauseEpisode: PropTypes.func.isRequired,
	playEpisode: PropTypes.func.isRequired,
	resumeEpisode: PropTypes.func.isRequired,
	player: PropTypes.shape({
		contextID: PropTypes.string,
		playing: PropTypes.bool,
	}),
	inPlayer: PropTypes.bool,
	description: PropTypes.string,
	images: PropTypes.shape({ og: PropTypes.string }),
	pinID: PropTypes.string,
	onNavigation: PropTypes.func,
	playable: PropTypes.bool,
	link: PropTypes.string,
	podcast: PropTypes.shape({
		_id: PropTypes.string.isRequired,
		title: PropTypes.string,
	}),
	publicationDate: PropTypes.string,
	recent: PropTypes.bool,
	title: PropTypes.string,
	foldersFeed: PropTypes.shape({}),
	location: PropTypes.shape({ pathname: PropTypes.string }).isRequired,
};

const mapDispatchToProps = (dispatch) => {
	return {
		dispatch,
		pauseEpisode: () => dispatch({ type: 'PAUSE_EPISODE' }),
		resumeEpisode: () => dispatch({ type: 'RESUME_EPISODE' }),
		playEpisode: (episodeID, podcastID) => {
			dispatch({
				contextID: podcastID,
				episodeID: episodeID,
				playing: true,
				type: 'PLAY_EPISODE',
			});
		},
	};
};

const mapStateToProps = (state, ownProps) => {
	return {
		inPlayer:
			state.player &&
			state.player.episodeID === ownProps._id &&
			state.player.contextID === ownProps.podcast._id,
		player: state.player || {},
		notes: state.notes || {},
		tagsFeed: state.tagsFeed || [],
		foldersFeed: state.foldersFeed || {},
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(EpisodeListItem));
