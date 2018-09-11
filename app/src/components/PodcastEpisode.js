import url from 'url';
import React from 'react';
import PropTypes from 'prop-types';
import ReactPlayer from 'react-player';
import ReactHtmlParser from 'react-html-parser';
import isElectron from 'is-electron';
import { connect } from 'react-redux';

import fetch from '../util/fetch';
import { pinEpisode, unpinEpisode } from '../util/pins';

import Loader from './Loader';
import TimeAgo from './TimeAgo';

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
		const episodeID = this.props.match.params.episodeID;

		this.getEpisode(episodeID);
		this.getEpisodeContent(episodeID);

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
			const res = await fetch(
				'GET',
				`/episodes/${episodeID}`,
				{},
				{ type: 'parsed' },
			);
			this.setState({ content: res.data.content, loadingContent: false });
		} catch (err) {
			this.setState({ error: true, loadingContent: false });
			if (window.console) console.log(err); // eslint-disable-line no-console
		}
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
			this.props.title
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

		return (
			<React.Fragment>
				{this.state.error && (
					<div>
						<p>There was a problem loading this episode :(</p>
						<p>
							Please go{' '}
							<u onClick={() => this.props.history.goBack()}>Back</u> to the
							Podcast page.
						</p>
					</div>
				)}

				{!this.state.error && (
					<React.Fragment>
						<div className="content-header">
							{this.state.loadingEpisode ? (
								<Loader />
							) : (
								<React.Fragment>
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
												<a href={this.props.link}>View on site</a>
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
	dispatch: PropTypes.func.isRequired,
	match: PropTypes.shape({
		params: PropTypes.shape({
			episodeID: PropTypes.string.isRequired,
		}),
	}),

	pinID: PropTypes.string,
	pinned: PropTypes.bool.isRequired,
};

const mapStateToProps = (state, ownProps) => {
	const episodeID = ownProps.match.params.episodeID;

	if (state.pinnedEpisodes && state.pinnedEpisodes[episodeID])
		return { pinned: true, pinID: state.pinnedEpisodes[episodeID]._id };

	return { pinned: false };
};

export default connect(mapStateToProps)(PodcastEpisode);
