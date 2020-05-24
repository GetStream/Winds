import React from 'react';
import PropTypes from 'prop-types';
import { Img } from 'react-image';
import { Waypoint } from 'react-waypoint';
import Popover from 'react-popover';
import { connect } from 'react-redux';

import getPlaceholderImageURL from '../util/getPlaceholderImageURL';
import EpisodeListItem from './EpisodeListItem';
import fetch from '../util/fetch';
import Loader from './Loader';
import AliasModal from './AliasModal';
import FolderPopover from '../components/Folder/FolderPopover';
import { followPodcast, unfollowPodcast } from '../api';

import { ReactComponent as LoaderIcon } from '../images/loaders/default.svg';
import { ReactComponent as CircleIcon } from '../images/icons/circle.svg';
import { ReactComponent as DotCircleIcon } from '../images/icons/dot-circle.svg';
import { ReactComponent as SettingIcon } from '../images/icons/settings.svg';

class PodcastEpisodesView extends React.Component {
	constructor(props) {
		super(props);

		this.resetState = {
			cursor: 1, // mongoose-api-query starts pages at 1, not 0
			newEpisodes: false,
			menuPopover: false,
			aliasModal: false,
			reachedEndOfFeed: false,
			loading: true,
			loadingEpisodes: true,
			podcast: { images: {} },
			episodes: [],
		};

		this.state = { ...this.resetState, sortBy: 'latest' };
	}

	subscribeToStreamFeed(podcastID, streamFeedToken) {
		this.unsubscribeFromStreamFeed();

		this.subscription = window.streamClient
			.feed('podcast', podcastID, streamFeedToken)
			.subscribe(() => this.setState({ newEpisodes: true }));
	}

	unsubscribeFromStreamFeed() {
		if (this.subscription) this.subscription.cancel();
	}

	componentDidMount() {
		const podcastID = this.props.match.params.podcastID;
		if (window.streamAnalyticsClient.userData)
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

			this.setState({ ...this.resetState }, () => {
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
		return array.filter((item) =>
			seen.hasOwnProperty(item._id) ? false : (seen[item._id] = true),
		);
	};

	getPodcastEpisodes = (podcastID, newFeed = false) => {
		this.setState({ loadingEpisodes: true });

		fetch(
			'GET',
			'/episodes',
			{},
			{
				page: newFeed ? 1 : this.state.cursor,
				per_page: 10,
				podcast: podcastID,
				sort_by: `publicationDate${
					this.state.sortBy === 'latest' ? ',desc' : ''
				}`,
			},
		)
			.then((res) => {
				this.setState({ loadingEpisodes: false });
				if (res.data.length === 0) this.setState({ reachedEndOfFeed: true });
				else if (newFeed) this.setState({ episodes: res.data, cursor: 1 });
				else
					this.setState((prevState) => ({
						episodes: this.uniqueArr([...prevState.episodes, ...res.data]),
					}));
			})
			.catch((err) => {
				this.setState({ loadingEpisodes: false, error: true });
				console.log(err); // eslint-disable-line no-console
			});
	};

	toggleMenuPopover = () => {
		this.setState((prevState) => ({ menuPopover: !prevState.menuPopover }));
	};

	toggleAliasModal = () => {
		this.setState((prevState) => ({ aliasModal: !prevState.aliasModal }));
	};

	setSortBy = (sortBy) => {
		if (this.state.sortBy === sortBy) return this.setState({ menuPopover: false });

		const podcastID = this.props.match.params.podcastID;
		this.setState(
			{
				episodes: [],
				cursor: 1,
				menuPopover: false,
				reachedEndOfFeed: false,
				sortBy,
			},
			() => {
				this.getPodcastEpisodes(podcastID);
			},
		);
	};

	render() {
		if (this.state.loading) return <Loader />;

		const dispatch = this.props.dispatch;
		const podcast = this.state.podcast;
		const title = this.props.aliases[podcast._id]
			? this.props.aliases[podcast._id].alias
			: podcast.title;
		const isFollowing = this.props.following[podcast._id]
			? this.props.following[podcast._id]
			: false;

		const episodes = this.state.episodes.map((episode) => {
			episode.pinID = this.props.pinnedEpisodes[episode._id]
				? this.props.pinnedEpisodes[episode._id]._id
				: '';

			episode.recent =
				this.props.feeds.episode &&
				this.props.feeds.episode.indexOf(episode._id) < 20 &&
				this.props.feeds.episode.indexOf(episode._id) !== -1;

			return episode;
		});

		const menuPopover = (
			<div className="popover-panel feed-popover">
				<div
					className="panel-element menu-item sort-button"
					onClick={() => this.setSortBy('latest')}
				>
					{this.state.sortBy === 'latest' ? <DotCircleIcon /> : <CircleIcon />}
					Latest
				</div>
				<div
					className="panel-element menu-item sort-button"
					onClick={() => this.setSortBy('oldest')}
				>
					{this.state.sortBy === 'oldest' ? <DotCircleIcon /> : <CircleIcon />}
					Oldest
				</div>

				<div className="panel-element menu-item" onClick={this.toggleAliasModal}>
					Rename
				</div>
				<div
					className="panel-element menu-item"
					onClick={() =>
						isFollowing
							? unfollowPodcast(dispatch, podcast._id)
							: followPodcast(dispatch, podcast._id)
					}
				>
					{isFollowing ? <span className="alert">Unfollow</span> : 'Follow'}
				</div>
			</div>
		);

		let rightColumn;

		if (this.state.loadingEpisodes && !episodes.length) {
			rightColumn = <Loader />;
		} else if (episodes.length === 0) {
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
					{episodes.map((episode) => {
						return <EpisodeListItem key={episode._id} {...episode} />;
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
									this.setState({ cursor: this.state.cursor + 1 }, () =>
										this.getPodcastEpisodes(podcast._id),
									);
								}}
							/>
							<div className="end-loader">
								<LoaderIcon />
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
						<div className="right">
							{!isFollowing && (
								<div
									className="follow"
									onClick={() => followPodcast(dispatch, podcast._id)}
								>
									FOLLOW
								</div>
							)}

							<FolderPopover feedID={podcast._id} isRss={false} />

							<Popover
								body={menuPopover}
								isOpen={this.state.menuPopover}
								onOuterAction={this.toggleMenuPopover}
								preferPlace="below"
								tipSize={0.1}
							>
								<div onClick={this.toggleMenuPopover}>
									<SettingIcon />
								</div>
							</Popover>
						</div>
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
					{this.state.newEpisodes && (
						<div
							className="toast"
							onClick={() => {
								this.getPodcastEpisodes(podcast._id, true);
								this.setState({ newEpisodes: false });
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

	dispatch: PropTypes.func.isRequired,
	match: PropTypes.shape({
		params: PropTypes.shape({
			podcastID: PropTypes.string,
		}),
	}),
};

const mapStateToProps = (state) => ({
	aliases: state.aliases || {},
	following: state.followedPodcasts || {},
	pinnedEpisodes: state.pinnedEpisodes || {},
	feeds: state.feeds || {},
});

export default connect(mapStateToProps)(PodcastEpisodesView);
