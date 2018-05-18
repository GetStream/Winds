import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import fetch from '../util/fetch';
import getPlaceholderImageURL from '../util/getPlaceholderImageURL';
import { Link } from 'react-router-dom';

class FeaturedItems extends React.Component {
	componentDidMount() {
		if (this.props.featuredItems.length === 0) {
			fetch('GET', '/featured').then(response => {
				// first, go through and update each item
				for (let item of response.data) {
					if (item.type === 'rss') {
						this.props.dispatch({
							rssFeed: item,
							type: 'UPDATE_RSS_FEED',
						});
					} else if (item.type === 'podcast') {
						this.props.dispatch({
							podcast: item,
							type: 'UPDATE_PODCAST_SHOW',
						});
					}
				}

				let featuredItemIDs = response.data.map(item => {
					return `${item.type}:${item._id}`;
				});
				// then, update the list of featured items
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
										.images.featured ||
										getPlaceholderImageURL(featuredItem._id)})`,
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
			if (featuredItemID.split(':')[0] === 'rss') {
				deserializedFeaturedItems.push({
					...state.rssFeeds[featuredItemID.split(':')[1]],
					type: 'rss',
				});
			} else if (featuredItemID.split(':')[0] === 'podcast') {
				deserializedFeaturedItems.push({
					...state.podcasts[featuredItemID.split(':')[1]],
					type: 'podcast',
				});
			}
		}
	}
	return { ...ownProps, featuredItems: deserializedFeaturedItems };
};

const mapDispatchToProps = (dispatch, ownProps) => {
	return {
		...ownProps,
		dispatch,
	};
};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
	return {
		...ownProps,
		...dispatchProps,
		...stateProps,
	};
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(FeaturedItems);
