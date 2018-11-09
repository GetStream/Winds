import React from 'react';
import PropTypes from 'prop-types';
import Img from 'react-image';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import TimeAgo from './TimeAgo';
import getPlaceholderImageURL from '../util/getPlaceholderImageURL';
import { pinEpisode, unpinEpisode } from '../util/pins';

import { ReactComponent as PauseIcon } from '../images/icons/pause.svg';
import { ReactComponent as PlayIcon } from '../images/icons/play.svg';

class EpisodeListItem extends React.Component {
	playOrPauseEpisode = () => {
		if (this.props.active && this.props.player.playing) this.props.pauseEpisode();
		else if (this.props.active) this.props.resumeEpisode();
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
				: `/podcasts/${podcastId}`;

		let icon;

		if (this.props.active) {
			icon = (
				<div className="pause-icon">
					<div className="icon-container">
						{this.props.player.playing ? <PauseIcon /> : <PlayIcon />}
					</div>
				</div>
			);
		} else {
			icon = (
				<div className="play-icon">
					<div className="icon-container">
						<PlayIcon />
					</div>
				</div>
			);
		}

		return (
			<div className="list-item podcast-episode">
				<div
					className="left"
					onClick={() => {
						if (this.props.playable) this.playOrPauseEpisode();
						else {
							if (this.props.onNavigation) this.props.onNavigation();
							this.props.history.push(link);
						}
					}}
				>
					<Img
						height="75"
						loader={<div className="placeholder" />}
						src={[
							this.props.images.og,
							this.props.podcast.images.featured,
							getPlaceholderImageURL(id),
						]}
						width="75"
					/>
					{this.props.playable ? icon : null}
					{this.props.recent ? <div className="recent-indicator" /> : null}
				</div>
				<div
					className="right"
					onClick={() => {
						if (this.props.onNavigation) this.props.onNavigation();
						this.props.history.push(
							this.props.playable ? link : `/podcasts/${podcastId}`,
						);
					}}
				>
					<h2>{this.props.title}</h2>
					<div className="item-info">
						<span
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								this.props.pinID
									? unpinEpisode(
										this.props.pinID,
										id,
										this.props.dispatch,
									  )
									: pinEpisode(id, this.props.dispatch);
							}}
						>
							<i
								className={`${
									this.props.pinID ? 'fas' : 'far'
								} fa-bookmark`}
							/>
						</span>
						{this.props.link && (
							<span>
								<i className="fa fa-external-link-alt" />
								<a
									href={this.props.link}
									onClick={(e) => e.stopPropagation()}
								>
									View on site
								</a>
							</span>
						)}
						<span>{this.props.podcast.title}</span>
						<span className="date">
							{'Posted '}
							<TimeAgo timestamp={this.props.publicationDate} />
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
	pinID: '',
	playable: true,
	recent: false,
};

EpisodeListItem.propTypes = {
	dispatch: PropTypes.func.isRequired,
	pauseEpisode: PropTypes.func.isRequired,
	playEpisode: PropTypes.func.isRequired,
	resumeEpisode: PropTypes.func.isRequired,
	player: PropTypes.shape({
		contextID: PropTypes.string,
		playing: PropTypes.bool,
	}),
	history: PropTypes.shape({
		push: PropTypes.func.isRequired,
	}).isRequired,
	active: PropTypes.bool,
	description: PropTypes.string,
	images: PropTypes.shape({
		og: PropTypes.string,
	}),
	pinID: PropTypes.string,
	playOrPauseEpisode: PropTypes.func,
	onNavigation: PropTypes.func,
	_id: PropTypes.string,
	playable: PropTypes.bool,
	link: PropTypes.string,
	podcast: PropTypes.shape({
		_id: PropTypes.string.isRequired,
		images: PropTypes.shape({
			featured: PropTypes.string,
		}),
		title: PropTypes.string,
	}).isRequired,
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
		active:
			state.player &&
			state.player.episodeID === ownProps._id &&
			state.player.contextID === ownProps.podcast._id,
		player: state.player || {},
		foldersFeed: state.foldersFeed || {},
	};
};

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(withRouter(EpisodeListItem));
