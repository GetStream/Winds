import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import fetch from '../util/fetch';
import Img from 'react-image';
import getPlaceholderImageURL from '../util/getPlaceholderImageURL';
import { Link } from 'react-router-dom';

class DiscoverSection extends React.Component {
	componentDidMount() {
		fetch('GET', '/podcasts', {}, { type: 'recommended' })
			.then(res => {
				// loop through podcasts, update each podcast
				for (let podcast of res.data) {
					this.props.dispatch({
						podcast,
						type: 'UPDATE_PODCAST_SHOW',
					});
				}

				// set "recommendedPodcasts" value in state
				// map podcasts to IDs, dispatch
				this.props.dispatch({
					podcasts: res.data,
					type: 'UPDATE_SUGGESTED_PODCASTS',
				});
			})
			.catch(err => {
				console.log(err); // eslint-disable-line no-console
			});
		fetch('GET', '/rss', {}, { type: 'recommended' })
			.then(res => {
				// loop through podcasts, update each podcast
				for (let rssFeed of res.data) {
					this.props.dispatch({
						rssFeed,
						type: 'UPDATE_RSS_FEED',
					});
				}

				// map rssFeeds to IDs, dispatch
				this.props.dispatch({
					rssFeeds: res.data,
					type: 'UPDATE_SUGGESTED_RSS_FEEDS',
				});
			})
			.catch(err => {
				console.log(err); // eslint-disable-line no-console
			});
	}
	render() {
		// grab the first 3 episodes
		let podcastGrid = this.props.suggestedPodcasts.slice(0, 3);
		let restOfPodcasts = this.props.suggestedPodcasts.slice(3);
		let allSuggestions = [...restOfPodcasts, ...this.props.suggestedRssFeeds];
		return (
			<div>
				<div className="shows-grid">
					{podcastGrid.map(podcast => {
						return (
							<div className="shows-grid-item" key={podcast._id}>
								<div
									className="shows-grid-item-image"
									style={{
										backgroundImage: `url(${podcast.images.featured ||
											getPlaceholderImageURL(podcast._id, {
												square: true,
											})})`,
									}}
								/>
								{podcast.title}
							</div>
						);
					})}
				</div>
				<div className="tiny-list">
					{allSuggestions.map(suggestion => {
						return (
							<Link
								key={suggestion._id}
								to={`${
									suggestion.type === 'podcast' ? 'podcasts' : 'rss'
								}/${suggestion._id}`}
							>
								<Img
									src={[
										suggestion.images.favicon,
										getPlaceholderImageURL(suggestion._id),
									]}
								/>
								<span>{suggestion.title}</span>
								<div>
									<span>{`View ${
										suggestion.type === 'podcast' ? 'Podcast' : 'Feed'
									}`}</span>
									<i className="fa fa-chevron-right" />
								</div>
							</Link>
						);
					})}
				</div>
			</div>
		);
	}
}

DiscoverSection.defaultProps = {
	suggestedPodcasts: [],
	suggestedRssFeeds: [],
};

DiscoverSection.propTypes = {
	dispatch: PropTypes.func.isRequired,
	suggestedPodcasts: PropTypes.array,
	suggestedRssFeeds: PropTypes.array,
};

const mapStateToProps = (state, ownProps) => {
	let suggestedPodcasts = [];
	let suggestedRssFeeds = [];

	if ('suggestedPodcasts' in state) {
		for (let podcastID of state.suggestedPodcasts) {
			suggestedPodcasts.push({ ...state.podcasts[podcastID], type: 'podcast' });
		}
	}
	if ('suggestedRssFeeds' in state) {
		for (let rssFeedID of state.suggestedRssFeeds) {
			suggestedRssFeeds.push({ ...state.rssFeeds[rssFeedID], type: 'rss' });
		}
	}

	return {
		...ownProps,
		suggestedPodcasts,
		suggestedRssFeeds,
	};
};

export default connect(mapStateToProps)(DiscoverSection);
