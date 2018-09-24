import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import fetch from '../util/fetch';
import getPlaceholderImageURL from '../util/getPlaceholderImageURL';
import { Link } from 'react-router-dom';

class FeaturedItems extends React.Component {
	componentDidMount() {
		if (this.props.featuredItems.length === 0) {
			fetch('GET', '/featured').then(res => {
				let rssFeeds = [];
				let podcasts = [];

				for (let item of res.data) {
					if (item.type === 'rss') {
						rssFeeds.push(item);
					} else if (item.type === 'podcast') {
						podcasts.push(item);
					}
				}

				this.props.dispatch({
					rssFeeds,
					type: 'BATCH_UPDATE_RSS_FEEDS',
				});

				this.props.dispatch({
					podcasts,
					type: 'BATCH_UPDATE_PODCASTS',
				});

				let featuredItemIDs = res.data.map(item => {
					return `${item.type}:${item._id}`;
				});

				this.props.dispatch({
					featuredItemIDs,
					type: 'UPDATE_FEATURED_ITEMS',
				});
			});
		}
	}

	render() {
		return (
			<div className="featured-items-section">
				<div className="featured-items-header">
					<h2>Featured on Winds</h2>
				</div>
				<div className="featured-item-list">
					{this.props.featuredItems.map(featuredItem => {
						let linkURL = '#';
						if (featuredItem.type === 'rss') {
							linkURL = `/rss/${featuredItem._id}?featured=true`;
						} else if (featuredItem.type === 'podcast') {
							linkURL = `/podcasts/${featuredItem._id}?featured=true`;
						}
						return (
							<Link
								className="featured-item"
								key={featuredItem._id}
								style={{
									backgroundImage: `linear-gradient(to top, black, transparent), url(${featuredItem
										.images.featured || getPlaceholderImageURL()})`,
								}}
								to={linkURL}
							>
								<h1>{featuredItem.title}</h1>
								<p />
								<label>{featuredItem.type}</label>
							</Link>
						);
					})}
				</div>
			</div>
		);
	}
}

FeaturedItems.defaultProps = {
	featuredItems: [],
};

FeaturedItems.propTypes = {
	dispatch: PropTypes.func.isRequired,
	featuredItems: PropTypes.array,
};

const mapStateToProps = (state, ownProps) => {
	let deserializedFeaturedItems = [];
	if (state.featuredItems) {
		for (let featuredItemID of state.featuredItems) {
			let [featuredItemType, featuredItemValue] = featuredItemID.split(':');
			if (featuredItemType === 'rss') {
				deserializedFeaturedItems.push({
					...state.rssFeeds[featuredItemValue],
					type: 'rss',
				});
			} else if (featuredItemType === 'podcast') {
				deserializedFeaturedItems.push({
					...state.podcasts[featuredItemValue],
					type: 'podcast',
				});
			}
		}
	}
	return {
		...ownProps,
		featuredItems: deserializedFeaturedItems,
	};
};

export default connect(mapStateToProps)(FeaturedItems);
