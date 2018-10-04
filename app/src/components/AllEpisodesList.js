import loaderIcon from '../images/loaders/default.svg';
import Img from 'react-image';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import EpisodeListItem from './EpisodeListItem';
import Waypoint from 'react-waypoint';
import { getFeed } from '../util/feeds';

class AllEpisodesList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			newEpisodesAvailable: false,
			cursor: 0,
			reachedEndOfFeed: false,
		};
	}

	componentDidMount() {
		this.setState({ cursor: Math.floor(this.props.episodes.length / 10) }, () => {
			this.getEpisodeFeed();
		});

		this.subscription = window.streamClient
			.feed('user_episode', this.props.userID, this.props.userEpisodeStreamToken)
			.subscribe(() => this.setState({ newArticlesAvailable: true }));
	}

	getEpisodeFeed() {
		getFeed(this.props.dispatch, 'episode', this.state.cursor, 10);
	}

	componentWillUnmount() {
		this.subscription.cancel();
	}

	render() {
		return (
			<React.Fragment>
				<div className="list-view-header content-header">
					<h1>Episodes</h1>
				</div>
				<div className="list content">
					{this.state.newEpisodesAvailable && (
						<div
							className="toast"
							onClick={() => {
								this.getEpisodeFeed();
								this.setState({ newEpisodesAvailable: false });
							}}
						>
							New episodes available - click to refresh
						</div>
					)}

					{this.props.episodes.map((episode) => (
						<EpisodeListItem key={episode._id} {...episode} />
					))}

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
										this.getEpisodeFeed(),
									);
								}}
							/>
							<div className="end-loader">
								<Img src={loaderIcon} />
							</div>
						</div>
					)}
				</div>
			</React.Fragment>
		);
	}
}

AllEpisodesList.defaultProps = {
	episodes: [],
};

AllEpisodesList.propTypes = {
	dispatch: PropTypes.func.isRequired,
	episodes: PropTypes.arrayOf(PropTypes.shape({})),
	userID: PropTypes.string.isRequired,
	userEpisodeStreamToken: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => {
	let episodes = [];

	if (state.episodes && state.feeds && state.feeds.episode)
		episodes = state.feeds.episode.map((id) => state.episodes[id]);

	for (let episode of episodes) {
		if (state.pinnedEpisodes && state.pinnedEpisodes[episode._id]) {
			episode.pinID = state.pinnedEpisodes[episode._id]._id;
		} else episode.pinID = '';

		if (
			state.feeds.episode.indexOf(episode._id) < 20 &&
			state.feeds.episode.indexOf(episode._id) !== -1
		) {
			episode.recent = true;
		} else episode.recent = false;
	}

	return {
		episodes,
		userEpisodeStreamToken: state.user.streamTokens.user_episode,
		userID: state.user._id,
	};
};

export default connect(mapStateToProps)(AllEpisodesList);
