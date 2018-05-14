import Tabs from '../components/Tabs';
import RecentEpisodesPanel from '../components/PodcastPanels/RecentEpisodesPanel';
import SuggestedPodcasts from '../components/PodcastPanels/SuggestedPodcasts';
import PodcastList from '../components/PodcastPanels/PodcastList';
import BookmarkedEpisodes from '../components/PodcastPanels/BookmarkedEpisodes';
import PodcastEpisodesView from '../components/PodcastEpisodesView';
import PropTypes from 'prop-types';
import React from 'react';
import fetch from '../util/fetch';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import AllEpisodes from '../components/AllEpisodes';

class PodcastsView extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			newPodcastModalIsOpen: false,
			selectedTab: localStorage['selectedPodcastTab'] || 'all',
		};
		this.toggleNewPodcastModal = this.toggleNewPodcastModal.bind(this);
	}
	componentDidMount() {
		// fetch new podcast
		if (this.props.match.params.podcastID) {
			fetch('get', `/podcasts/${this.props.match.params.podcastID}`).then(
				response => {
					this.props.dispatch({
						podcast: response.data,
						type: 'UPDATE_PODCAST_SHOW',
					});
				},
			);
		}
	}
	componentWillReceiveProps(nextProps) {
		if (this.props.match.params.podcastID !== nextProps.match.params.podcastID) {
			fetch('get', `/podcasts/${nextProps.match.params.podcastID}`).then(
				response => {
					this.props.dispatch({
						podcast: response.data,
						type: 'UPDATE_PODCAST_SHOW',
					});
				},
			);
		}
	}
	toggleNewPodcastModal() {
		this.setState({
			newPodcastModalIsOpen: !this.state.newPodcastModalIsOpen,
		});
	}

	render() {
		// let episodeView;
		// if (!this.props.match.params.podcastID) {
		// 	episodeView = (
		// 		<div className="none-selected">
		// 			<Img src={partialIcon} />
		// 			<div>Select a Podcast</div>
		// 		</div>
		// 	);
		// } else {
		// 	episodeView = <EpisodesView podcastID={this.props.match.params.podcastID} />;
		// }

		//
		// let leftColumn;

		// if (this.props.podcast && this.props.podcast.featured) {
		// 	leftColumn = (
		// 		<div className="column">
		// 			<div className="column-header" />
		// 			<div className="column-content featured-podcast">
		// 				<div
		// 					className="hero-card"
		// 					style={{
		// 						backgroundImage: `linear-gradient(to top, black, transparent), url(${
		// 							this.props.podcast.images.featured
		// 						})`,
		// 					}}
		// 				>
		// 					<h1>{this.props.podcast.title}</h1>
		// 					<div className="info">podcast</div>
		// 				</div>
		// 				<label>About {this.props.podcast.title}</label>
		// 				<h1>{this.props.podcast.description}</h1>
		// 				<div>{this.props.podcast.summary}</div>
		// 				<FollowerList id={this.props.podcast._id} type="podcast" />
		// 			</div>
		// 		</div>
		// 	);
		// } else {
		// 	leftColumn = (
		// 		<div className="column">
		// 			<div className="column-content">{selectedTabComponents}</div>
		// 		</div>
		// 	);
		// }
		return (
			<div className="two-columns podcasts-view">
				<div className="column">
					<div className="column-header">
						<h1>Podcasts</h1>
					</div>
					<Tabs tabGroup="podcast-view">
						<div tabTitle="All Podcasts">
							<RecentEpisodesPanel />
							<PodcastList />
						</div>
						<div tabTitle="Bookmarks">
							<BookmarkedEpisodes />
						</div>
						<div tabTitle="Suggestions">
							<SuggestedPodcasts />
						</div>
					</Tabs>
				</div>
				<div className="column">
					<Switch>
						<Route component={recentEpisodes} path="/podcasts/recent" />
						<Route
							component={PodcastEpisodesView}
							path="/podcasts/:podcastID"
						/>
						<Route component={AllEpisodes} path="/podcasts" />
					</Switch>
				</div>
			</div>
		);
	}
}

let recentEpisodes = () => {
	return <div>recent episodes</div>;
};

PodcastsView.propTypes = {
	dispatch: PropTypes.func.isRequired,
	match: PropTypes.shape({
		params: PropTypes.shape({
			podcastID: PropTypes.string,
		}).isRequired,
	}).isRequired,
	podcast: PropTypes.shape({
		_id: PropTypes.string,
		description: PropTypes.string,
		featured: PropTypes.boolean,
		images: PropTypes.shape({
			featured: PropTypes.string,
		}),
		summary: PropTypes.string,
		title: PropTypes.title,
	}),
	selectedPodcast: PropTypes.string,
};

const mapStateToProps = (state, ownProps) => {
	if (ownProps.match.params.podcastID && state.podcasts) {
		return {
			...ownProps,
			podcast: { ...state.podcasts[ownProps.match.params.podcastID] },
		};
	} else {
		return { ...ownProps };
	}
};

const mapDispatchToProps = (dispatch, ownProps) => {
	return { ...ownProps, dispatch };
};

export default connect(mapStateToProps, mapDispatchToProps)(PodcastsView);
