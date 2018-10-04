import loaderIcon from '../images/loaders/default.svg';
import Waypoint from 'react-waypoint';
import getPlaceholderImageURL from '../util/getPlaceholderImageURL';
import EpisodeListItem from './EpisodeListItem';
import Img from 'react-image';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import Popover from 'react-popover';
import fetch from '../util/fetch';
import moment from 'moment';
import Loader from './Loader';
import AliasModal from './AliasModal';
import { followPodcast, unfollowPodcast } from '../api';

class PodcastEpisodesView extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			episodeCursor: 1, // mongoose-api-query starts pages at 1, not 0
			sortBy: 'latest',
			newEpisodesAvailable: false,
			menuPopover: false,
			aliasModal: false,
			loading: true,
			podcast: { images: {} },
			episodes: [],
		};
	}

	subscribeToStreamFeed(podcastID, streamFeedToken) {
		this.unsubscribeFromStreamFeed();

		this.subscription = window.streamClient
			.feed('podcast', podcastID, streamFeedToken)
			.subscribe(() => this.setState({ newEpisodesAvailable: true }));
	}

	unsubscribeFromStreamFeed() {
		if (this.subscription) this.subscription.cancel();
	}

	componentDidMount() {
		const podcastID = this.props.match.params.podcastID;

		window.streamAnalyticsClient.trackEngagement({
			label: 'viewed_podcast',
			content: `podcast:${podcastID}`,
		});

		this.getPodcast(podcastID);
		this.getPodcastEpisodes(podcastID);
	}

	componentDidUpdate(prevProps) {
		if (prevProps.match.params.podcastID !== this.props.match.params.podcastID) {
			const podcastID = this.props.match.params.podcastID;

			window.streamAnalyticsClient.trackEngagement({
				label: 'viewed_podcast',
				content: `podcast:${podcastID}`,
			});

			this.unsubscribeFromStreamFeed();

			this.setState({ episodeCursor: 1 }, () => {
				this.getPodcast(podcastID);
				this.getPodcastEpisodes(podcastID);
			});
		}
	}

	componentWillUnmount() {
		this.unsubscribeFromStreamFeed();
	}

	getPodcast = (podcastID) => {
		this.setState({ loading: true });

		fetch('GET', `/podcasts/${podcastID}`)
			.then((res) =>
				this.setState({ podcast: res.data, loading: false }, () => {
					this.subscribeToStreamFeed(
						this.state.podcast._id,
						this.state.podcast.streamToken,
					);
				}),
			)
			.catch((err) => {
				console.log(err); // eslint-disable-line no-console
			});
	};

	uniqueArr = (array) => {
		const seen = {};
		return array.filter(
			(item) => (seen.hasOwnProperty(item._id) ? false : (seen[item._id] = true)),
		);
	};

	getPodcastEpisodes = (podcastID, newFeed = false) => {
		fetch(
			'GET',
			'/episodes',
			{},
			{
				page: newFeed ? 1 : this.state.episodeCursor,
				per_page: 10,
				podcast: podcastID,
				sort_by: 'publicationDate,desc',
			},
		)
			.then((res) => {
				if (res.data.length === 0) this.setState({ reachedEndOfFeed: true });
				else if (newFeed) this.setState({ episodes: res.data });
				else
					this.setState((prevState) => ({
						episodes: this.uniqueArr([...prevState.episodes, ...res.data]),
					}));
			})
			.catch((err) => {
				console.log(err); // eslint-disable-line no-console
			});
	};

	toggleMenuPopover = () => {
		this.setState((prevState) => ({ menuPopover: !prevState.menuPopover }));
	};

	toggleAliasModal = () => {
		this.setState((prevState) => ({ aliasModal: !prevState.aliasModal }));
	};

	render() {
		if (this.state.loading) return <Loader />;

		const podcast = this.state.podcast;

		const isFollowing = this.props.following[podcast._id]
			? this.props.following[podcast._id]
			: false;

		const title = this.props.aliases[podcast._id]
			? this.props.aliases[podcast._id].alias
			: podcast.title;

		let episodes = this.state.episodes.sort(
			(a, b) =>
				moment(b.publicationDate).valueOf() - moment(a.publicationDate).valueOf(),
		);

		episodes = episodes.map((episode) => {
			if (this.props.pinnedEpisodes[episode._id]) {
				episode.pinID = this.props.pinnedEpisodes[episode._id]._id;
			} else episode.pinID = '';

			if (
				this.props.feeds.episode &&
				this.props.feeds.episode.indexOf(episode._id) < 20 &&
				this.props.feeds.episode.indexOf(episode._id) !== -1
			) {
				episode.recent = true;
			} else episode.recent = false;

			return episode;
		});

		const menuPopover = (
			<div className="popover-panel feed-popover">
				<div className="panel-element menu-item" onClick={this.toggleAliasModal}>
					Rename
				</div>
				<div
					className="panel-element menu-item"
					onClick={() =>
						isFollowing
							? unfollowPodcast(this.props.dispatch, podcast._id)
							: followPodcast(this.props.dispatch, podcast._id)
					}
				>
					{isFollowing ? <span className="red">Unfollow</span> : 'Follow'}
				</div>
			</div>
		);

		let rightColumn;

		if (episodes.length === 0) {
			rightColumn = (
				<div>
					<p>We haven&#39;t found any episodes for this podcast feed yet :(</p>
					<p>
						It might be because the podcast feed doesn&#39;t have any
						episodes, or because it just got added and we&#39;re still parsing
						them. Come check back in a few minutes.
					</p>
					<p>
						If you&#39;re pretty sure there&#39;s supposed to be some episodes
						here, and they aren&#39;t showing up, please file a{' '}
						<a href="https://github.com/getstream/winds/issues">
							GitHub Issue
						</a>
						.
					</p>
				</div>
			);
		} else {
			rightColumn = (
				<div>
					{episodes.map((episode, i) => {
						const active =
							this.props.player.contextID === podcast._id &&
							episode._id === this.props.player.episodeID;

						return (
							<EpisodeListItem
								active={active}
								key={episode._id}
								playOrPauseEpisode={() => {
									if (active && this.props.player.playing)
										this.props.pauseEpisode();
									else if (active) this.props.resumeEpisode();
									else this.props.playEpisode(episode._id, podcast._id);
								}}
								playable={true}
								playing={this.props.player.playing}
								position={i}
								{...episode}
							/>
						);
					})}
					{this.state.reachedEndOfFeed ? (
						<div className="end">
							<p>That&#39;s it! No more episodes here.</p>
							<p>
								What, did you think that once you got all the way around,
								you&#39;d just be back at the same place that you started?
								Sounds like some real round-feed thinking to me.
							</p>
						</div>
					) : (
						<div>
							<Waypoint
								onEnter={() => {
									this.setState(
										{ episodeCursor: this.state.episodeCursor + 1 },
										() => this.getPodcastEpisodes(podcast._id),
									);
								}}
							/>
							<div className="end-loader">
								<Img src={loaderIcon} />
							</div>
						</div>
					)}
				</div>
			);
		}

		return (
			<React.Fragment>
				<div className="content-header list-view-header">
					<div className="alignment-box">
						<div className="image">
							<Img
								src={[
									podcast.images.featured,
									podcast.images.og,
									getPlaceholderImageURL(podcast._id),
								]}
							/>
						</div>
						<h1>{title}</h1>
						{!isFollowing && (
							<div
								className="follow menu"
								onClick={() =>
									followPodcast(this.props.dispatch, podcast._id)
								}
							>
								FOLLOW
							</div>
						)}

						<Popover
							body={menuPopover}
							isOpen={this.state.menuPopover}
							onOuterAction={this.toggleMenuPopover}
							preferPlace="below"
							tipSize={0.1}
						>
							<div
								className={isFollowing ? 'menu' : 'menu-pop'}
								onClick={this.toggleMenuPopover}
							>
								&bull; &bull; &bull;
							</div>
						</Popover>
					</div>
				</div>

				<AliasModal
					defVal={title}
					feedID={podcast._id}
					isOpen={this.state.aliasModal}
					isRss={false}
					toggleModal={this.toggleAliasModal}
				/>

				<div className="list podcast-episode-list content">
					{this.state.newEpisodesAvailable && (
						<div
							className="toast"
							onClick={() => {
								this.getPodcastEpisodes(podcast._id, true);
								this.setState({ newEpisodesAvailable: false });
							}}
						>
							New Episodes Available - Click to Refresh
						</div>
					)}
					{rightColumn}
				</div>
			</React.Fragment>
		);
	}
}

PodcastEpisodesView.defaultProps = {
	aliases: {},
	following: {},
	pinnedEpisodes: {},
	feeds: {},
};

PodcastEpisodesView.propTypes = {
	following: PropTypes.shape({}),
	aliases: PropTypes.shape({}),
	player: PropTypes.shape({
		contextID: PropTypes.string,
		playing: PropTypes.bool,
	}),
	dispatch: PropTypes.func.isRequired,
	match: PropTypes.shape({
		params: PropTypes.shape({
			podcastID: PropTypes.string,
		}),
	}),
	pauseEpisode: PropTypes.func.isRequired,
	playEpisode: PropTypes.func.isRequired,
	resumeEpisode: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
	aliases: state.aliases || {},
	following: state.followedPodcasts || {},
	pinnedEpisodes: state.pinnedEpisodes || {},
	feeds: state.feeds || {},
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
				contextType: 'podcast',
				episodeID: episodeID,
				playing: true,
				type: 'PLAY_EPISODE',
			});
		},
	};
};

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(PodcastEpisodesView);
