import filledLikeIcon from '../images/icons/like-filled.svg';
import inactivePinLogo from '../images/icons/pin-inactive.svg';
import likeIcon from '../images/icons/like.svg';

import Img from 'react-image';
import Popover from 'react-popover';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import fetch from '../util/fetch';
import moment from 'moment';
import pauseIcon from '../images/icons/pause.svg';
import addDarkIcon from '../images/icons/add-dark.svg';
import playIcon from '../images/icons/play.svg';
import pinIcon from '../images/icons/pin.svg';

class EpisodeListItem extends React.Component {
	constructor(props) {
		super(props);
		this.state = { addToPlaylistPopoverIsOpen: false };
		this.toggleAddToPlaylistPopover = this.toggleAddToPlaylistPopover.bind(this);
	}
	toggleAddToPlaylistPopover() {
		this.setState({
			addToPlaylistPopoverIsOpen: !this.state.addToPlaylistPopoverIsOpen,
		});
	}
	render() {
		let addToPlaylistPopoverBody = (
			<div className="list">
				{this.props.playlists.map(playlist => {
					return (
						<div
							className="list-item"
							key={playlist._id}
							onClick={e => {
								e.preventDefault();
								e.stopPropagation();
								// now, do the thing where we append to the specified playlist
								this.props.addEpisodeToPlaylist(
									this.props._id,
									playlist._id,
								);
								this.toggleAddToPlaylistPopover();
							}}
						>
							{playlist.name}
						</div>
					);
				})}
			</div>
		);

		let addToPlaylistButton = (
			<Popover
				body={addToPlaylistPopoverBody}
				className="add-to-playlist-popover popover"
				isOpen={this.state.addToPlaylistPopoverIsOpen}
				onOuterAction={this.toggleAddToPlaylistPopover}
				preferPlace="below"
				tipSize={0.1}
			>
				<span
					onClick={e => {
						e.preventDefault();
						e.stopPropagation();
						this.toggleAddToPlaylistPopover();
					}}
				>
					<Img src={addDarkIcon} />
				</span>
			</Popover>
		);

		let icon;
		if (this.props.active) {
			icon = (
				<div className="pause-icon">
					<div className="icon-container">
						{this.props.playing ? (
							<Img src={pauseIcon} />
						) : (
							<Img src={playIcon} />
						)}
					</div>
				</div>
			);
		} else {
			icon = (
				<div className="play-icon">
					<div className="icon-container">
						<Img src={playIcon} />
					</div>
				</div>
			);
		}

		return (
			<div
				className="list-item podcast-episode"
				onClick={() => {
					this.props.playOrPauseEpisode();
				}}
			>
				<div className="left">
					<Img height="100" src={this.props.image} width="100" />
					{icon}
				</div>
				<div className="right">
					<h2>{`${this.props.title}`}</h2>
					<div className="info">
						{addToPlaylistButton}
						<span
							onClick={e => {
								e.preventDefault();
								e.stopPropagation();
								if (this.props.pinned) {
									this.props.unpinEpisode();
								} else {
									this.props.pinEpisode();
								}
							}}
						>
							{this.props.pinned ? (
								<Img src={pinIcon} />
							) : (
								<Img src={inactivePinLogo} />
							)}
						</span>
						<span
							className="likes"
							onClick={e => {
								e.preventDefault();
								e.stopPropagation();
								this.props.toggleLike();
							}}
						>
							{this.props.liked ? (
								<Img src={filledLikeIcon} />
							) : (
								<Img src={likeIcon} />
							)}
						</span>
						<span className="date">
							{moment(this.props.publicationDate).format('MMM DD, YYYY')}
						</span>
					</div>
					<div className="description">{this.props.description}</div>
				</div>
			</div>
		);
	}
}

EpisodeListItem.defaultProps = {
	liked: false,
	likes: 0,
	pinned: false,
	playing: false,
};

EpisodeListItem.propTypes = {
	_id: PropTypes.string.isRequired,
	active: PropTypes.bool,
	addEpisodeToPlaylist: PropTypes.func.isRequired,
	description: PropTypes.string,
	image: PropTypes.arrayOf(PropTypes.string),
	liked: PropTypes.bool,
	likes: PropTypes.number,
	pinEpisode: PropTypes.func.isRequired,
	pinned: PropTypes.bool,
	playOrPauseEpisode: PropTypes.func.isRequired,
	playing: PropTypes.bool,
	playlists: PropTypes.arrayOf(PropTypes.shape({})),
	podcastImage: PropTypes.string,
	publicationDate: PropTypes.string,
	title: PropTypes.string,
	toggleLike: PropTypes.func.isRequired,
	unpinEpisode: PropTypes.func.isRequired,
};

const mapStateToProps = (state, ownProps) => {
	// convert playlists in state to array
	let playlists = [];
	let playlistsAsObjects = {};
	for (let playlistID in state.playlists) {
		if (state.playlists.hasOwnProperty(playlistID)) {
			if (state.playlists[playlistID].user === localStorage['authedUser']) {
				playlists.push(state.playlists[playlistID]);
				playlistsAsObjects[playlistID] = state.playlists[playlistID];
			}
		}
	}
	return {
		...ownProps,
		playlists,
		playlistsAsObjects,
	};
};

const mapDispatchToProps = (dispatch, ownProps) => {
	return {
		...ownProps,
		updatePlaylist: playlist => {
			dispatch({
				playlist,
				type: 'UPDATE_PLAYLIST',
			});
		},
	};
};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
	return {
		...stateProps,
		...dispatchProps,
		...ownProps,
		addEpisodeToPlaylist: (episodeID, playlistID) => {
			// get playlists from stateprops
			let playlists = stateProps.playlistsAsObjects;
			let playlistEpisodes = [...playlists[playlistID].episodes];
			// then make an API call to update playlist episodes. then, make the dispatch call to update playlist.
			playlistEpisodes.push(episodeID);
			fetch('PUT', `/playlists/${playlistID}`, {
				episodes: playlistEpisodes,
			}).then(response => {
				dispatchProps.updatePlaylist(response.data);
			});
		},
	};
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(EpisodeListItem);
