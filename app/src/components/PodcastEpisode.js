import url from 'url';
import React from 'react';
import PropTypes from 'prop-types';
import ReactHtmlParser from 'react-html-parser';
import isElectron from 'is-electron';
import Img from 'react-image';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import fetch from '../util/fetch';
import { pinEpisode, unpinEpisode, getPinnedEpisodes } from '../util/pins';
import Loader from './Loader';
import TimeAgo from './TimeAgo';
import getPlaceholderImageURL from '../util/getPlaceholderImageURL';
import pauseIcon from '../images/icons/pause.svg';
import playIcon from '../images/icons/play.svg';
import { getPodcastById, getPodcastEpisodes } from '../api';

class PodcastEpisode extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			episode: {},
			content: '',
			error: false,
			loadingEpisode: true,
			loadingContent: true,
		};
	}

	componentDidMount() {
		this.fetchAllData();
	}

	componentDidUpdate(prevProps) {
		if (prevProps.match.params.episodeID !== this.props.match.params.episodeID)
			this.fetchAllData();
	}

	fetchAllData() {
		const episodeID = this.props.match.params.episodeID;
		const podcastID = this.props.match.params.podcastID;

		this.setState({ error: false });
		this.getEpisode(episodeID);
		this.getEpisodeContent(episodeID);
		getPinnedEpisodes(this.props.dispatch);

		if (!this.props.episodes) {
			// In order to make the Player works in direct access to page
			getPodcastEpisodes(podcastID);
			getPodcastById(podcastID);
		}

		window.streamAnalyticsClient.trackEngagement({
			label: 'episode_open',
			content: { foreign_id: `episode:${episodeID}` },
		});
	}

	async getEpisode(episodeID) {
		this.setState({ loadingEpisode: true });

		try {
			const res = await fetch('GET', `/episodes/${episodeID}`);
			this.setState({ episode: res.data, loadingEpisode: false });
		} catch (err) {
			this.setState({ error: true, loadingEpisode: false });
			if (window.console) console.log(err); // eslint-disable-line no-console
		}
	}

	async getEpisodeContent(episodeID) {
		this.setState({ loadingContent: true });

		try {
			const res = await fetch('GET', `/episodes/${episodeID}?type=parsed`);
			this.setState({ content: res.data.content, loadingContent: false });
		} catch (err) {
			this.setState({ error: true, loadingContent: false });
			if (window.console) console.log(err); // eslint-disable-line no-console
		}
	}

	playOrPause() {
		const episode = this.state.episode;
		const player = this.props.player;
		const isActive = player && player.episodeID === episode._id;
		const isPlaying = isActive && player.playing;

		if (!isActive)
			this.props.dispatch({
				contextID: episode.podcast._id,
				contextPosition: 0, //TODO: Ideally, API should send the episode position
				contextType: 'podcast',
				episodeID: episode._id,
				playing: true,
				type: 'PLAY_EPISODE',
			});
		else if (isPlaying) this.props.dispatch({ type: 'PAUSE_EPISODE' });
		else this.props.dispatch({ type: 'RESUME_EPISODE' });
	}

	tweet() {
		const location = url.parse(window.location.href);
		const link = {
			protocol: 'https',
			hostname: 'winds.getstream.io',
			pathname: location.pathname,
		};
		if (location.pathname === '/' && location.hash) {
			link.pathname = location.hash.slice(1);
		}
		const shareUrl = `https://twitter.com/intent/tweet?url=${url.format(link)}&text=${
			this.state.episode.title
		}&hashtags=Winds,RSS`;

		if (isElectron()) {
			window.ipcRenderer.send('open-external-window', shareUrl);
		} else {
			const getWindowOptions = function() {
				const width = 500;
				const height = 350;
				const left = window.innerWidth / 2 - width / 2;
				const top = window.innerHeight / 2 - height / 2;

				return [
					'resizable,scrollbars,status',
					'height=' + height,
					'width=' + width,
					'left=' + left,
					'top=' + top,
				].join();
			};

			const win = window.open(shareUrl, 'Share on Twitter', getWindowOptions());
			win.opener = null;
		}
	}

	render() {
		const episode = this.state.episode;
		const player = this.props.player;
		const isPlaying = player && player.playing && player.episodeID === episode._id;

		return (
			<React.Fragment>
				{this.state.error && (
					<div>
						<p>There was a problem loading this episode :(</p>
						<p>
							Please refresh the page or go back to the{' '}
							<Link to={`/podcasts/${episode.podcast._id}`}>
								Podcast page
							</Link>{' '}
							and play it from there!
						</p>
					</div>
				)}

				{!this.state.error && (
					<React.Fragment>
						<div className="content-header episode-header">
							{this.state.loadingEpisode ? (
								<Loader />
							) : (
								<React.Fragment>
									<h1
										className="left"
										onClick={() => this.playOrPause()}
									>
										<Img
											className="og-image"
											src={[
												episode.images.og,
												episode.podcast.images.featured,
												getPlaceholderImageURL(),
											]}
											loader={<div className="placeholder" />}
										/>
										<div className="play-icon">
											<div className="icon-container">
												<Img
													src={isPlaying ? pauseIcon : playIcon}
												/>
											</div>
										</div>
									</h1>
									<div className="right">
										<h1>{episode.title}</h1>
										<div className="item-info">
											<span
												className="bookmark"
												onClick={() => {
													if (this.props.pinned) {
														unpinEpisode(
															this.props.pinID,
															episode._id,
															this.props.dispatch,
														);
													} else {
														pinEpisode(
															episode._id,
															this.props.dispatch,
														);
													}
												}}
											>
												{this.props.pinned ? (
													<i className="fas fa-bookmark" />
												) : (
													<i className="far fa-bookmark" />
												)}
											</span>{' '}
											{this.props.link && (
												<span>
													<i className="fa fa-external-link-alt" />
													<a href={this.props.link}>
														View on site
													</a>
												</span>
											)}{' '}
											<span>
												<a
													href="tweet"
													onClick={e => {
														e.preventDefault();
														e.stopPropagation();
														this.tweet();
													}}
												>
													<i className="fab fa-twitter" />
												</a>
											</span>
											<div>
												<a href={episode.url}>
													{episode.podcast.title}
												</a>
											</div>
											<span className="muted">
												{'Posted '}
												<TimeAgo
													timestamp={episode.publicationDate}
												/>
											</span>
										</div>
									</div>
								</React.Fragment>
							)}
						</div>

						<div className="content">
							{this.state.loadingContent ? (
								<Loader />
							) : (
								<div className="rss-article-content">
									{ReactHtmlParser(this.state.content)}
								</div>
							)}
						</div>
					</React.Fragment>
				)}
			</React.Fragment>
		);
	}
}

PodcastEpisode.propTypes = {
	pinID: PropTypes.string,
	pinned: PropTypes.bool.isRequired,
	player: PropTypes.object,
	dispatch: PropTypes.func.isRequired,
	match: PropTypes.shape({
		params: PropTypes.shape({
			episodeID: PropTypes.string.isRequired,
			podcastID: PropTypes.string.isRequired,
		}),
	}),
};

const mapStateToProps = (state, ownProps) => {
	const episodeID = ownProps.match.params.episodeID;

	let pinned, pinID;
	if (state.pinnedEpisodes && state.pinnedEpisodes[episodeID]) {
		pinned = true;
		pinID = state.pinnedEpisodes[episodeID]._id;
	} else {
		pinned = false;
	}

	return {
		pinned,
		pinID,
		player: state.player,
		episodes: state.episodes,
	};
};

export default connect(mapStateToProps)(PodcastEpisode);
