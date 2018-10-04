import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import Img from 'react-image';
import getPlaceholderImageURL from '../util/getPlaceholderImageURL';
import { Link } from 'react-router-dom';
import { getSuggestedRss, getSuggestedPodcasts } from '../api/';

class DiscoverSection extends React.Component {
	componentDidMount() {
		getSuggestedPodcasts(this.props.dispatch);
		getSuggestedRss(this.props.dispatch);
	}

	render() {
		const podcastGrid = this.props.suggestedPodcasts.slice(0, 3);
		const allSuggestions = [
			...this.props.suggestedRssFeeds,
			...this.props.suggestedPodcasts.slice(3),
		];
		allSuggestions.sort(() => Math.random() >= 0.5);

		return (
			<div>
				<div className="shows-grid">
					{podcastGrid.map((podcast) => {
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
											getPlaceholderImageURL(podcast._id, true)})`,
									}}
								/>
								{podcast.title}
							</Link>
						);
					})}
				</div>
				<div className="tiny-list">
					{allSuggestions.map((suggestion) => {
						return (
							<Link
								key={suggestion._id}
								to={`${
									suggestion.type === 'podcast' ? 'podcasts' : 'rss'
								}/${suggestion._id}`}
							>
								<Img
									loader={<div className="placeholder" />}
									src={[
										suggestion.images.favicon,
										getPlaceholderImageURL(suggestion._id),
									]}
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

const mapStateToProps = (state) => {
	if (!state.suggestedPodcasts || !state.suggestedRssFeeds)
		return {
			suggestedPodcasts: [],
			suggestedRssFeeds: [],
		};

	const suggestedPodcasts = state.suggestedPodcasts.map((item) => ({
		...item,
		type: 'podcast',
	}));
	const suggestedRssFeeds = state.suggestedRssFeeds.map((item) => ({
		...item,
		type: 'rss',
	}));

	return {
		suggestedPodcasts,
		suggestedRssFeeds,
	};
};

export default connect(mapStateToProps)(DiscoverSection);
