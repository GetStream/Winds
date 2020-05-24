import Tabs from '../components/Tabs';
import RecentEpisodesPanel from '../components/PodcastPanels/RecentEpisodesPanel';
import SuggestedPodcasts from '../components/PodcastPanels/SuggestedPodcasts';
import PodcastList from '../components/PodcastPanels/PodcastList';
import BookmarkPanel from '../components/BookmarkPanel';
import PodcastEpisodesView from '../components/PodcastEpisodesView';
import PropTypes from 'prop-types';
import React from 'react';
import { getPodcastById } from '../api';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import AllEpisodesList from '../components/AllEpisodesList';
import PodcastEpisode from '../components/PodcastEpisode';

class PodcastsView extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			newPodcastModalIsOpen: false,
		};

		this.container = React.createRef();
	}

	componentDidMount() {
		this.container.current.focus();

		if (
			this.props.location.search.includes('featured') &&
			this.props.match.params.podcastID
		)
			getPodcastById(this.props.dispatch, this.props.match.params.podcastID);
	}

	componentDidUpdate(prevProps) {
		if (
			this.props.location.search.includes('featured') &&
			this.props.match.params.podcastID !== prevProps.match.params.podcastID
		)
			getPodcastById(this.props.dispatch, this.props.match.params.podcastID);
	}

	toggleNewPodcastModal = () => {
		this.setState((prevState) => ({
			newPodcastModalIsOpen: !prevState.newPodcastModalIsOpen,
		}));
	};

	render() {
		const featured = this.props.location.search.includes('featured');

		let leftColumn;
		if (featured) {
			leftColumn = (
				<React.Fragment>
					<div className="panels-header">
						<div className="featured">
							<div
								className="hero-card"
								style={{
									backgroundImage: `linear-gradient(to top, black, transparent), url(${this.props.podcast.images.featured})`,
								}}
							>
								<h1>{this.props.podcast.title}</h1>
								<div className="info">podcast</div>
							</div>
						</div>
					</div>
					<div className="panels">
						<label>About {this.props.podcast.title}</label>
						<h1>{this.props.podcast.description}</h1>
						<div>{this.props.podcast.summary}</div>
					</div>
				</React.Fragment>
			);
		} else {
			leftColumn = (
				<React.Fragment>
					<Tabs
						componentClass="panels"
						headerClass="panels-header"
						headerComponent={<h1>Podcasts</h1>}
						tabGroup="podcast-view"
					>
						<div tabTitle="All Podcasts">
							<RecentEpisodesPanel />
							<PodcastList />
						</div>
						<div tabTitle="Bookmarks">
							<BookmarkPanel type="episode" />
						</div>
						<div tabTitle="Suggestions">
							<SuggestedPodcasts />
						</div>
					</Tabs>
				</React.Fragment>
			);
		}

		return (
			<div
				className={`grid-view podcasts-view ${featured ? 'featured' : ''}`}
				onKeyDown={(e) => {
					e = e || window.e;
					if (('key' in e && e.key === 'Escape') || e.keyCode === 27)
						this.props.history.goBack();
				}}
				ref={this.container}
				tabIndex="-1"
			>
				{leftColumn}
				<div className="border" />
				<Switch>
					<Route
						component={PodcastEpisode}
						path="/podcasts/:podcastID/episodes/:episodeID"
					/>
					<Route component={PodcastEpisodesView} path="/podcasts/:podcastID" />
					<Route component={AllEpisodesList} path="/podcasts" />
				</Switch>
			</div>
		);
	}
}

PodcastsView.defaultProps = {
	podcast: { images: {} },
};

PodcastsView.propTypes = {
	dispatch: PropTypes.func.isRequired,
	history: PropTypes.shape({ goBack: PropTypes.func.isRequired }).isRequired,
	match: PropTypes.shape({
		params: PropTypes.shape({
			podcastID: PropTypes.string,
		}).isRequired,
	}).isRequired,
	location: PropTypes.shape({ search: PropTypes.string }).isRequired,
	podcast: PropTypes.shape({
		_id: PropTypes.string,
		description: PropTypes.string,
		featured: PropTypes.bool,
		images: PropTypes.shape({
			featured: PropTypes.string,
		}),
		summary: PropTypes.string,
		title: PropTypes.string,
	}),
	selectedPodcast: PropTypes.string,
};

const mapStateToProps = (state, ownProps) => {
	if (ownProps.match.params.podcastID && state.podcasts) {
		return {
			...ownProps,
			podcast: state.podcasts[ownProps.match.params.podcastID],
		};
	} else {
		return { ...ownProps };
	}
};

export default connect(mapStateToProps)(PodcastsView);
