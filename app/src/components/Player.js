import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Img from 'react-image';
import ReactAudioPlayer from 'react-audio-player';
import Slider from 'rc-slider';
import moment from 'moment';
import isElectron from 'is-electron';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import 'moment-duration-format'; // eslint-disable-line sort-imports

import fetch from '../util/fetch';
import nextIcon from '../images/player/next.svg';
import forwardIcon from '../images/player/forward.svg';
import rewindIcon from '../images/player/rewind.svg';
import pauseIcon from '../images/icons/pause.svg';
import playIcon from '../images/icons/play.svg';

class Player extends Component {
	constructor(props) {
		super(props);

		this.state = {
			episodeListenAnalyticsEventSent: false,
			playbackSpeed: 1,
			progress: 0,
			volume: 0.5,
			episodes: {},
			episodesOrder: [],
		};

		this.playbackSpeedOptions = [1, 1.25, 1.5, 1.75, 2];
		this.lastSent = 0;
	}

	componentDidMount() {
		if (isElectron())
			window.ipcRenderer.on('media-controls', this.incomingMediaControls);
	}

	componentWillUnmount() {
		if (isElectron())
			window.ipcRenderer.removeAllListeners(
				'media-controls',
				this.incomingMediaControls,
			);
	}

	componentDidUpdate(prevProps) {
		const player = this.props.player;

		if (!player) return;
		if (player.contextID !== prevProps.player.contextID) {
			this.getEpisodes(player.contextID, player.episodeID);
			this.setState({ episodeListenAnalyticsEventSent: false });

			window.streamAnalyticsClient.trackEngagement({
				label: 'episode_listen_start',
				content: { foreign_id: `episodes:${player.episodeID}` },
			});
		} else if (player.episodeID !== prevProps.player.episodeID) {
			if (!this.state.episodes[player.episodeID])
				return this.getEpisodes(player.podcastID, player.episodeID);

			this.setState({ episodeListenAnalyticsEventSent: false });
			this.resetPlaybackSpeed();

			fetch('GET', '/listens', null, {
				episode: player.episodeID,
			}).then((res) => {
				if (res.data.length !== 0)
					this.setInitialPlaybackTime(res.data[0].duration).then(() => {
						this.audioPlayerElement.audioEl.play();
					});
				else this.audioPlayerElement.audioEl.play();
			});

			window.streamAnalyticsClient.trackEngagement({
				label: 'episode_listen_start',
				content: { foreign_id: `episodes:${player.episodeID}` },
			});
		} else if (!prevProps.player.playing && player.playing) {
			this.audioPlayerElement.audioEl.play();
			this.pushNotification(this.state.episodes[player.episodeID]);
			this.mediaControl(true, this.state.episodes[player.episodeID]);
		} else if (prevProps.player.playing && !player.playing) {
			this.audioPlayerElement.audioEl.pause();
			this.mediaControl(false, this.state.episodes[player.episodeID]);
		}
	}

	getEpisodes = async (podcastID, episodeID) => {
		this.setState({ episodesOrder: [] });

		try {
			const res = await fetch(
				'GET',
				'/episodes',
				{},
				{ podcast: podcastID, sort_by: 'publicationDate,desc' },
			);

			const episodes = res.data.reduce((result, item) => {
				result[item._id] = item;
				return result;
			}, {});

			const episodesOrder = res.data.map((episode) => episode._id);

			this.setState({ episodes, episodesOrder }, () => {
				this.resetPlaybackSpeed();
				this.pushNotification(this.state.episodes[episodeID]);
				this.mediaControl(true, this.state.episodes[episodeID]);
			});

			const listen = await fetch('GET', '/listens', null, {
				episode: episodeID,
			});

			if (listen.data.length !== 0)
				this.setInitialPlaybackTime(listen.data[0].duration).then(() => {
					this.audioPlayerElement.audioEl.play();
					this.resetPlaybackSpeed();
				});
			else this.audioPlayerElement.audioEl.play();
		} catch (err) {
			console.log(err); // eslint-disable-line no-console
		}
	};

	nextTrack = () => {
		const currentIndex = this.state.episodesOrder.findIndex(
			(item) => this.props.player.episodeID === item,
		);

		if (currentIndex + 1 !== this.state.episodesOrder.length) {
			this.props.playEpisode(
				this.props.player.contextID,
				this.state.episodesOrder[currentIndex + 1],
				'podcast',
			);
		} else {
			this.setState({ episode: {}, episodesOrder: [] });
			this.props.clearPlayer();
		}
	};

	pushNotification = (episode) => {
		if (!episode) return;
		if ('Notification' in window) {
			if (
				Notification.permission !== 'denied' ||
				Notification.permission === 'default'
			)
				Notification.requestPermission();

			if (Notification.permission === 'granted') {
				new Notification(episode.podcast.title, {
					body: episode.title,
					icon: episode.podcast.image,
					silent: true,
				});
			}
		}
	};

	mediaControl = (isPlaying, episode) => {
		if (isElectron()) {
			if (isPlaying) {
				window.ipcRenderer.send('media-controls', {
					type: 'play',
					title: `${episode.title} - ${episode.podcast.title}`,
				});
			} else window.ipcRenderer.send('media-controls', { type: 'pause' });
		}
	};

	togglePlayPause = () => {
		this.props.player.playing ? this.props.pause() : this.props.play();
	};

	skipAhead = () => {
		let currentPlaybackPosition = this.audioPlayerElement.audioEl.currentTime;
		this.audioPlayerElement.audioEl.currentTime = currentPlaybackPosition + 30;
		this.updateProgress(this.audioPlayerElement.audioEl.currentTime);
	};

	skipBack = () => {
		let currentPlaybackPosition = this.audioPlayerElement.audioEl.currentTime;
		this.audioPlayerElement.audioEl.currentTime = currentPlaybackPosition - 30;
		this.updateProgress(this.audioPlayerElement.audioEl.currentTime);
	};

	cyclePlaybackSpeed = () => {
		const nextSpeed = this.playbackSpeedOptions[
			(this.playbackSpeedOptions.indexOf(this.state.playbackSpeed) + 1) %
				this.playbackSpeedOptions.length
		];
		this.setState({ playbackSpeed: nextSpeed });
		this.audioPlayerElement.audioEl.playbackRate = nextSpeed;
	};

	resetPlaybackSpeed = () => {
		const resetSpeed = this.playbackSpeedOptions[0];
		this.setState({ playbackSpeed: resetSpeed });
		this.audioPlayerElement.audioEl.playbackRate = resetSpeed;
	};

	seekTo = (progress) => {
		this.audioPlayerElement.audioEl.currentTime =
			progress * this.audioPlayerElement.audioEl.duration;
		this.updateProgress(this.audioPlayerElement.audioEl.currentTime);
	};

	updateProgress = (seconds) => {
		let progress = (seconds / this.audioPlayerElement.audioEl.duration) * 100;
		this.setState({
			currentTime: seconds,
			duration: this.audioPlayerElement.audioEl.duration,
			progress,
		});
	};

	setInitialPlaybackTime = (currentTime) => {
		return new Promise((resolve) => {
			this.audioPlayerElement.audioEl.currentTime = currentTime;
			this.setState({ currentTime }, () => resolve());
		});
	};

	incomingMediaControls = (event, args) => {
		if (args === 'togglePlayPause') this.togglePlayPause();
		else if (args === 'next') this.skipAhead();
		else if (args === 'previous') this.skipBack();
	};

	render() {
		const player = this.props.player;

		if (!player.episodeID || !this.state.episodesOrder.length) return null;

		const episode = this.state.episodes[player.episodeID];

		let contextURL = '';
		if (player.contextType === 'playlist') {
			contextURL = `/playlists/${player.contextID}`;
		} else if (player.contextType === 'podcast') {
			contextURL = `/podcasts/${player.contextID}`;
		}

		return (
			<div className="player">
				<div className="left">
					<Img
						className="poster"
						decode={false}
						height="40"
						src={episode ? episode.podcast.image : null}
						width="40"
					/>
					<div className="rewind" onClick={this.skipBack}>
						<Img decode={false} src={rewindIcon} />
					</div>

					{player.playing ? (
						<div className="btn pause" onClick={this.togglePlayPause}>
							<Img decode={false} src={pauseIcon} />
						</div>
					) : (
						<div className="btn play" onClick={this.togglePlayPause}>
							<Img decode={false} src={playIcon} />
						</div>
					)}

					<div className="forward" onClick={this.skipAhead}>
						<Img decode={false} src={forwardIcon} />
					</div>
					<div className="speed" onClick={this.cyclePlaybackSpeed}>
						{this.state.playbackSpeed}x
					</div>
				</div>
				<div className="middle">
					<div
						className="progress-bar"
						style={{ width: `${this.state.progress}%` }}
					/>
					<div
						className="progress-bar-click-catcher"
						onClick={(e) =>
							this.seekTo(e.nativeEvent.offsetX / e.target.clientWidth)
						}
					/>
					<div className="media">
						<div className="title">{episode ? episode.title : ''}</div>
						{episode && (
							<div className="info">
								<span className="episode">{episode.podcast.title}</span>
								<span className="date">
									{moment(episode.publicationDate).format('MMM D YYYY')}
								</span>
							</div>
						)}
					</div>
					<div className="sub-right">
						<div className="timestamps">
							{`${moment
								.duration(this.state.currentTime, 'seconds')
								.format('h:mm:ss', {
									stopTrim: 'mm',
								})} / ${moment
								.duration(this.state.duration, 'seconds')
								.format('h:mm:ss', {
									stopTrim: 'mm',
								})}`}
						</div>
					</div>
				</div>
				<div className="right">
					<Slider
						max={1}
						min={0}
						onChange={(volume) => this.setState({ volume })}
						step={0.1}
						value={this.state.volume}
					/>
					<Link className="next" to={contextURL}>
						<Img src={nextIcon} />
					</Link>
				</div>
				<ReactAudioPlayer
					listenInterval={500}
					onEnded={() => this.nextTrack()}
					onListen={(seconds) => {
						if (!episode) return;
						this.updateProgress(seconds);

						if (
							!this.state.episodeListenAnalyticsEventSent *
							(seconds / this.audioPlayerElement.audioEl.duration > 0.8)
						) {
							window.streamAnalyticsClient.trackEngagement({
								label: 'episode_listen_complete',
								content: { foreign_id: `episodes:${episode._id}` },
							});

							this.setState({ episodeListenAnalyticsEventSent: true });
						}

						const currentTime = new Date().valueOf();
						if (currentTime - this.lastSent >= 15000) {
							this.lastSent = currentTime;
							fetch('POST', '/listens', {
								duration: this.audioPlayerElement.audioEl.currentTime,
								episode: episode._id,
							});
						}
					}}
					ref={(element) => {
						this.audioPlayerElement = element;
					}}
					src={episode ? episode.enclosure : null}
					volume={this.state.volume}
				/>
			</div>
		);
	}
}

Player.propTypes = {
	player: PropTypes.shape({
		contextID: PropTypes.string,
		contextType: PropTypes.string,
		episodeID: PropTypes.string,
		playing: PropTypes.bool,
	}),
	pause: PropTypes.func.isRequired,
	play: PropTypes.func.isRequired,
	playEpisode: PropTypes.func.isRequired,
	clearPlayer: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({ player: state.player || {} });

const mapDispatchToProps = (dispatch) => ({
	pause: () => dispatch({ type: 'PAUSE_EPISODE' }),
	play: () => dispatch({ type: 'RESUME_EPISODE' }),
	clearPlayer: () => dispatch({ type: 'CLEAR_PLAYER' }),
	playEpisode: (podcastID, episodeID, type) => {
		dispatch({
			contextID: podcastID,
			episodeID: episodeID,
			contextType: type,
			playing: true,
			type: 'PLAY_EPISODE',
		});
	},
});

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(Player);
