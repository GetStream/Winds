import AddPodcastModal from '../components/AddPodcastModal';
import EpisodesView from '../components/EpisodesView';
import Img from 'react-image';
import ListOfFollowedPodcasts from '../components/ListOfFollowedPodcasts';
import PodcastPanelsContainer from '../components/PodcastPanelsContainer';
import PropTypes from 'prop-types';
import React from 'react';
import fetch from '../util/fetch';
import { connect } from 'react-redux';
import FollowerList from '../components/FollowerList';
import partialIcon from '../images/icons/partial.svg';

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
		let episodeView;
		if (!this.props.match.params.podcastID) {
			episodeView = (
				<div className="none-selected">
					<Img src={partialIcon} />
					<div>Select a Podcast</div>
				</div>
			);
		} else {
			episodeView = <EpisodesView podcastID={this.props.match.params.podcastID} />;
		}

		let selectedTabComponents;
		if (this.state.selectedTab === 'all') {
			selectedTabComponents = <PodcastPanelsContainer />;
		} else if (this.state.selectedTab === 'my-podcasts') {
			selectedTabComponents = <ListOfFollowedPodcasts />;
		}

		let leftColumn;

		if (this.props.podcast && this.props.podcast.featured) {
			leftColumn = (
				<div className="column">
					<div className="column-header" />
					<div className="column-content featured-podcast">
						<div
							className="hero-card"
							style={{
								backgroundImage: `linear-gradient(to top, black, transparent), url(${
									this.props.podcast.images.featured
								})`,
							}}
						>
							<h1>{this.props.podcast.title}</h1>
							<div className="info">podcast</div>
						</div>
						<label>About {this.props.podcast.title}</label>
						<h1>{this.props.podcast.description}</h1>
						<div>{this.props.podcast.summary}</div>
						<FollowerList id={this.props.podcast._id} type="podcast" />
					</div>
				</div>
			);
		} else {
			leftColumn = (
				<div className="column">
					<div className="column-header">
						<div className="heading-with-button">
							<h1>Podcasts</h1>
							<Img
								className="plus-button"
								onClick={this.toggleNewPodcastModal}
								src={'/images/icons/add.svg'}
							/>
						</div>
						<ul className="tabs">
							<li
								className={`tab ${
									this.state.selectedTab === 'all' ? 'active' : ''
								}`}
								onClick={() => {
									localStorage['selectedPodcastTab'] = 'all';
									this.setState({
										selectedTab: 'all',
									});
								}}
							>
								All
							</li>
							<li
								className={`tab ${
									this.state.selectedTab === 'my-podcasts'
										? 'active'
										: ''
								}`}
								onClick={() => {
									localStorage['selectedPodcastTab'] = 'my-podcasts';
									this.setState({
										selectedTab: 'my-podcasts',
									});
								}}
							>
								My Podcasts
							</li>
						</ul>
					</div>
					<div className="column-content">{selectedTabComponents}</div>
					<AddPodcastModal
						done={this.toggleNewPodcastModal}
						isOpen={this.state.newPodcastModalIsOpen}
						toggleModal={this.toggleNewPodcastModal}
					/>
				</div>
			);
		}
		return (
			<div className="two-columns podcasts-view">
				{leftColumn}
				<div className="column">{episodeView}</div>
			</div>
		);
	}
}

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
			podcast: state.podcasts[ownProps.match.params.podcastID],
		};
	} else {
		return { ...ownProps };
	}
};

const mapDispatchToProps = (dispatch, ownProps) => {
	return { ...ownProps, dispatch };
};

export default connect(mapStateToProps, mapDispatchToProps)(PodcastsView);
