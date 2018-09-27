import nextIcon from '../images/player/next.svg';
import forwardIcon from '../images/player/forward.svg';
import rewindIcon from '../images/player/rewind.svg';
import pauseIcon from '../images/icons/pause.svg';
import playIcon from '../images/icons/play.svg';
import React, { Component } from 'react';
import Img from 'react-image';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import ReactAudioPlayer from 'react-audio-player';
import Slider from 'rc-slider';
import { connect } from 'react-redux';
import moment from 'moment';
import isElectron from 'is-electron';
import 'moment-duration-format'; // eslint-disable-line sort-imports
import fetch from '../util/fetch';

class Player extends Component {
	constructor(props) {
		super(props);

		this.state = {
			episodeListenAnalyticsEventSent: false,
			playbackSpeed: 1,
			playing: false,
			progress: 0,
			volume: 0.5,
		};

		this.playbackSpeedOptions = [1, 1.25, 1.5, 1.75, 2];
		this.lastSent = 0;

		this.cyclePlaybackSpeed = this.cyclePlaybackSpeed.bind(this);
		this.setVolume = this.setVolume.bind(this);
		this.seekTo = this.seekTo.bind(this);
		this.togglePlayPause = this.togglePlayPause.bind(this);
		this.incomingMediaControls = this.incomingMediaControls.bind(this);
	}

	componentDidMount() {
		this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();

		if (this.props.episode) {
			this.audioPlayerElement.audioEl.volume = this.state.volume / 100;
		}

		if (isElectron()) {
			window.ipcRenderer.on('media-controls', this.incomingMediaControls);
		}
	}

	componentWillUnmount() {
		if (isElectron()) {
			window.ipcRenderer.removeAllListeners(
				'media-controls',
				this.incomingMediaControls,
			);
		}
	}

	componentDidUpdate(prevProps) {
		if (!this.props.episode) {
			return;
		} else if (!prevProps.playing && this.props.playing) {
			if (!prevProps.episode) {
				window.streamAnalyticsClient.trackEngagement({
					label: 'episode_listen_start',
					content: {
						foreign_id: `episodes:${this.props.episode._id}`,
					},
				});

				fetch('GET', '/listens', null, { episode: this.props.episode._id }).then(
					(res) => {
						if (res.data.length !== 0) {
							this.setInitialPlaybackTime(res.data[0].duration).then(() => {
								this.audioPlayerElement.audioEl.play();
							});
						} else {
							this.audioPlayerElement.audioEl.play();
						}
					},
				);
			} else {
				this.audioPlayerElement.audioEl.play();
			}
		} else if (prevProps.playing && !this.props.playing) {
			this.audioPlayerElement.audioEl.pause();
		} else if (this.props.episode._id !== prevProps.episode._id) {
			this.setState({
				episodeListenAnalyticsEventSent: false,
			});
			this.resetPlaybackSpeed();
			window.streamAnalyticsClient.trackEngagement({
				label: 'episode_listen_start',
				content: {
					foreign_id: `episodes:${this.props.episode._id}`,
				},
			});

			fetch('GET', '/listens', null, { episode: this.props.episode._id }).then(
				(res) => {
					if (res.data.length !== 0) {
						this.setInitialPlaybackTime(res.data[0].duration).then(() => {
							this.audioPlayerElement.audioEl.play();
						});
					} else {
						this.audioPlayerElement.audioEl.play();
					}
				},
			);
		}
	}

	togglePlayPause() {
		if (this.props.playing) {
			this.props.pause();
		} else {
			this.props.play();
		}
	}

	skipAhead() {
		let currentPlaybackPosition = this.audioPlayerElement.audioEl.currentTime;
		this.audioPlayerElement.audioEl.currentTime = currentPlaybackPosition + 30;
		this.updateProgress(this.audioPlayerElement.audioEl.currentTime);
	}

	skipBack() {
		let currentPlaybackPosition = this.audioPlayerElement.audioEl.currentTime;
		this.audioPlayerElement.audioEl.currentTime = currentPlaybackPosition - 30;
		this.updateProgress(this.audioPlayerElement.audioEl.currentTime);
	}

	cyclePlaybackSpeed() {
		let nextSpeed = this.playbackSpeedOptions[
			(this.playbackSpeedOptions.indexOf(this.state.playbackSpeed) + 1) %
				this.playbackSpeedOptions.length
		];

		this.setState({
			playbackSpeed: nextSpeed,
		});

		this.audioPlayerElement.audioEl.playbackRate = nextSpeed;
	}

	resetPlaybackSpeed = () => {
		const resetSpeed = this.playbackSpeedOptions[0];
		this.setState({ playbackSpeed: resetSpeed });
		this.audioPlayerElement.audioEl.playbackRate = resetSpeed;
	};

	setVolume(volume) {
		this.setState({
			volume,
		});
	}

	seekTo(progress) {
		this.audioPlayerElement.audioEl.currentTime =
			progress * this.audioPlayerElement.audioEl.duration;
		this.updateProgress(this.audioPlayerElement.audioEl.currentTime);
	}

	updateProgress(seconds) {
		let progress = (seconds / this.audioPlayerElement.audioEl.duration) * 100;
		this.setState({
			currentTime: seconds,
			duration: this.audioPlayerElement.audioEl.duration,
			progress,
		});
	}

	setInitialPlaybackTime(currentTime) {
		return new Promise((resolve) => {
			this.audioPlayerElement.audioEl.currentTime = currentTime;
			this.setState(
				{
					currentTime,
				},
				() => {
					resolve();
				},
			);
		});
	}

	incomingMediaControls(event, args) {
		if (args === 'togglePlayPause') {
			this.togglePlayPause();
		} else if (args === 'next') {
			this.skipAhead();
		} else if (args === 'previous') {
			this.skipBack();
		}
	}

	render() {
		if (!this.props.episode) {
			return null;
		}

		let playButton = (
			<div className="btn play" onClick={this.togglePlayPause}>
				<Img decode={false} src={playIcon} />
			</div>
		);

		let pauseButton = (
			<div className="btn pause" onClick={this.togglePlayPause}>
				<Img decode={false} src={pauseIcon} />
			</div>
		);

		let contextURL = '';
		if (this.props.context.contextType === 'playlist') {
			contextURL = `/playlists/${this.props.context.contextID}`;
		} else if (this.props.context.contextType === 'podcast') {
			contextURL = `/podcasts/${this.props.context.contextID}`;
		}

		return (
			<div className="player">
				<div className="left">
					<Img
						className="poster"
						decode={false}
						height="40"
						src={this.props.episode.podcast.image}
						width="40"
					/>
					<div
						className="rewind"
						onClick={() => {
							this.skipBack();
						}}
					>
						<Img decode={false} src={rewindIcon} />
					</div>
					{this.props.playing ? pauseButton : playButton}
					<div
						className="forward"
						onClick={() => {
							this.skipAhead();
						}}
					>
						<Img decode={false} src={forwardIcon} />
					</div>
					<div className="speed" onClick={this.cyclePlaybackSpeed}>
						{this.state.playbackSpeed}x
					</div>
				</div>
				<div className="middle">
					<div
						className="progress-bar"
						style={{
							width: `${this.state.progress}%`,
						}}
					/>
					<div
						className="progress-bar-click-catcher"
						onClick={(e) => {
							this.seekTo(e.nativeEvent.offsetX / e.target.clientWidth);
						}}
					/>
					<div className="media">
						<div className="title">{this.props.episode.title}</div>
						<div className="info">
							<span className="episode">
								{this.props.episode.podcast.title}
							</span>
							<span className="date">
								{moment(this.props.episode.publicationDate).format(
									'MMM D YYYY',
								)}
							</span>
						</div>
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
						onChange={this.setVolume}
						step={0.1}
						value={this.state.volume}
					/>
					<Link className="next" to={contextURL}>
						<Img src={nextIcon} />
					</Link>
				</div>
				<ReactAudioPlayer
					listenInterval={500}
					onEnded={() => {
						this.setState({
							playing: false,
						});

						this.props.nextTrack();
					}}
					onListen={(seconds) => {
						this.updateProgress(seconds);

						if (
							!this.state.episodeListenAnalyticsEventSent *
							(seconds / this.audioPlayerElement.audioEl.duration > 0.8)
						) {
							window.streamAnalyticsClient.trackEngagement({
								label: 'episode_listen_complete',
								content: {
									foreign_id: `episodes:${this.props.episode._id}`,
								},
							});

							this.setState({
								episodeListenAnalyticsEventSent: true,
							});
						}

						let currentTime = new Date().valueOf();
						if (currentTime - this.lastSent >= 15000) {
							this.lastSent = currentTime;
							fetch('POST', '/listens', {
								duration: this.audioPlayerElement.audioEl.currentTime,
								episode: this.props.episode._id,
								user: this.props.currentUserID,
							});
						}
					}}
					ref={(element) => {
						this.audioPlayerElement = element;
					}}
					src={this.props.episode.enclosure}
					volume={this.state.volume}
				/>
			</div>
		);
	}
}

Player.propTypes = {
	episode: null,
	playing: false,
};

Player.propTypes = {
	context: PropTypes.shape({
		contextID: PropTypes.string,
		contextPosition: PropTypes.number,
		contextType: PropTypes.string,
		episodeID: PropTypes.string,
	}),
	currentUserID: PropTypes.string,
	episode: PropTypes.shape({
		_id: PropTypes.string,
		enclosure: PropTypes.string,
		podcast: PropTypes.shape({
			image: PropTypes.string,
			title: PropTypes.string,
		}),
		publicationDate: PropTypes.string,
		title: PropTypes.string,
	}),
	nextTrack: PropTypes.func.isRequired,
	pause: PropTypes.func.isRequired,
	play: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
	if (!('player' in state)) {
		return { episode: null };
	}

	let episode = { ...state.episodes[state.player.episodeID] };
	episode.podcast = { ...state.podcasts[episode.podcast] }; // populate podcast parent too

	let context = { ...state.player };

	if (isElectron()) {
		if (context.playing) {
			window.ipcRenderer.send('media-controls', {
				type: 'play',
				title: `${episode.title} - ${episode.podcast.title}`,
			});
		} else {
			window.ipcRenderer.send('media-controls', {
				type: 'pause',
			});
		}
	}

	if (context.playing) {
		if ('Notification' in window) {
			if (
				Notification.permission !== 'denied' ||
				Notification.permission === 'default'
			) {
				Notification.requestPermission();
			}

			if (Notification.permission === 'granted') {
				new Notification(episode.podcast.title, {
					body: episode.title,
					icon: episode.podcast.image,
					silent: true,
				});
			}
		}
	}

	let currentUserID = localStorage['authedUser'];

	return {
		context,
		currentUserID,
		episode,
		playing: context.playing,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		nextTrack: () => {
			dispatch({ type: 'NEXT_TRACK' });
		},
		pause: () => {
			dispatch({ type: 'PAUSE_EPISODE' });
		},
		play: () => {
			dispatch({ type: 'RESUME_EPISODE' });
		},
	};
};

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(Player);
