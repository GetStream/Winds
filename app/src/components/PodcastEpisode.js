import React from 'react';
import PropTypes from 'prop-types';
import url from 'url';
import isElectron from 'is-electron';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import fetch from '../util/fetch';
import Loader from './Loader';
import FeedHeader from './FeedHeader';
import HtmlRender from './HtmlRender';
import { pinEpisode, unpinEpisode } from '../util/pins';

class PodcastEpisode extends React.Component {
	constructor(props) {
		super(props);

		this.resetState = {
			episode: {},
			content: '',
			errorContent: false,
			loading: true,
			loadingContent: true,
		};

		this.state = { ...this.resetState };
	}

	componentDidMount() {
		this.fetchAllData();
	}

	componentDidUpdate(prevProps) {
		if (prevProps.match.params.episodeID !== this.props.match.params.episodeID) {
			this.setState({ ...this.resetState });
			this.fetchAllData();
		}
	}

	fetchAllData = () => {
		const episodeID = this.props.match.params.episodeID;

		this.getEpisode(episodeID);
		this.getEpisodeContent(episodeID);

		if (window.streamAnalyticsClient.userData)
			window.streamAnalyticsClient.trackEngagement({
				label: 'episode_open',
				content: { foreign_id: `episode:${episodeID}` },
			});
	};

	getEpisode = async (episodeID) => {
		this.setState({ loading: true });

		try {
			const res = await fetch('GET', `/episodes/${episodeID}`);
			this.setState({ episode: res.data, loading: false });
		} catch (err) {
			this.setState({ error: true, loading: false });
			console.log(err); // eslint-disable-line no-console
		}
	};

	getEpisodeContent = async (episodeID) => {
		this.setState({ loadingContent: true });

		try {
			const res = await fetch('GET', `/episodes/${episodeID}?type=parsed`);
			this.setState({ content: res.data.content, loadingContent: false });
		} catch (err) {
			this.setState({ errorContent: true, loadingContent: false });
			console.log(err); // eslint-disable-line no-console
		}
	};

	playOrPauseEpisode = () => {
		const episode = this.state.episode;
		const player = this.props.player;
		const isActive = player && player.episodeID === episode._id;
		const isPlaying = isActive && player.playing;

		if (!isActive) this.props.playEpisode(episode._id, episode.podcast._id);
		else if (isPlaying) this.props.pauseEpisode();
		else this.props.resumeEpisode();
	};

	tweet = () => {
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
			const getWindowOptions = function () {
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
	};

	render() {
		if (this.state.loading) return <Loader />;

		const episode = this.state.episode;
		const player = this.props.player;
		const isPlaying = player && player.playing && player.episodeID === episode._id;

		const pinID =
			this.props.pinnedEpisodes && this.props.pinnedEpisodes[episode._id]
				? this.props.pinnedEpisodes[episode._id]._id
				: '';

		return (
			<React.Fragment>
				<FeedHeader
					{...episode}
					isPlaying={isPlaying}
					pin={() => pinEpisode(episode._id, this.props.dispatch)}
					pinID={pinID}
					playOrPauseEpisode={this.playOrPauseEpisode}
					playable={true}
					tweet={this.tweet}
					type="episode"
					unpin={() => unpinEpisode(pinID, episode._id, this.props.dispatch)}
				/>

				<div className="content feed-content-wrapper">
					{!this.state.errorContent && this.state.loadingContent ? (
						<Loader />
					) : (
						<HtmlRender
							content={this.state.content}
							id={episode._id}
							type="episode"
						/>
					)}

					{this.state.errorContent && !this.state.loadingContent && (
						<div>
							<p>There was a problem loading this episode :(</p>
							<p>
								Please refresh the page or go to the{' '}
								<Link
									to={`/podcasts/${
										!!episode.podcast && episode.podcast._id
									}`}
								>
									Podcast page
								</Link>{' '}
								and play it from there!
							</p>
						</div>
					)}
				</div>
			</React.Fragment>
		);
	}
}

PodcastEpisode.propTypes = {
	pinnedEpisodes: PropTypes.object,
	dispatch: PropTypes.func.isRequired,
	pauseEpisode: PropTypes.func.isRequired,
	playEpisode: PropTypes.func.isRequired,
	resumeEpisode: PropTypes.func.isRequired,
	match: PropTypes.shape({
		params: PropTypes.shape({
			episodeID: PropTypes.string.isRequired,
			podcastID: PropTypes.string,
		}),
	}),
	player: PropTypes.shape({
		contextID: PropTypes.string,
		episodeID: PropTypes.string,
		playing: PropTypes.bool,
	}),
};

const mapStateToProps = (state) => ({
	pinnedEpisodes: state.pinnedEpisodes || {},
	player: state.player || {},
});

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

export default connect(mapStateToProps, mapDispatchToProps)(PodcastEpisode);
