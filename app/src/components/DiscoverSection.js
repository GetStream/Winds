import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import Img from 'react-image';
import getPlaceholderImageURL from '../util/getPlaceholderImageURL';
import { Link } from 'react-router-dom';
import { getRss, getPodcasts } from '../api/';

class DiscoverSection extends React.Component {
	componentDidMount() {
		getPodcasts(this.props.dispatch);
		getRss(this.props.dispatch);
	}

	render() {
		let podcastGrid = this.props.suggestedPodcasts.slice(0, 3);
		let restOfPodcasts = this.props.suggestedPodcasts.slice(3);
		let allSuggestions = [...restOfPodcasts, ...this.props.suggestedRssFeeds];

		return (
			<div>
				<div className="shows-grid">
					{podcastGrid.map(podcast => {
						return (
							<Link
								className="shows-grid-item"
								key={podcast._id}
								to={`/podcasts/${podcast._id}`}
							>
								<div
									className="shows-grid-item-image"
									style={{
										backgroundImage: `url(${podcast.images.featured ||
											getPlaceholderImageURL(true)})`,
									}}
								/>
								{podcast.title}
							</Link>
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
										getPlaceholderImageURL(),
									]}
									loader={<div className="placeholder" />}
									unloader={<div />}
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
