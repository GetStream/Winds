import { Link } from 'react-router-dom';
import getPlaceholderImageURL from '../../util/getPlaceholderImageURL';
import Img from 'react-image';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import fetch from '../../util/fetch';
import Panel from '../Panel';

class SuggestedFeeds extends React.Component {
	componentDidMount() {
		fetch('get', '/rss', {}, { type: 'recommended' })
			.then(response => {
				this.props.dispatch({
					rssFeeds: response.data,
					type: 'BATCH_UPDATE_RSS_FEEDS',
				});
				this.props.dispatch({
					rssFeeds: response.data,
					type: 'UPDATE_SUGGESTED_RSS_FEEDS',
				});
			})
			.catch(err => {
				console.log(err); // eslint-disable-line no-console
			});
		fetch('get', '/follows', null, {
			type: 'rss',
			user: localStorage['authedUser'],
		})
			.then(response => {
				let rssFeeds = [];
				let rssFeedFollowRelationships = [];

				this.props.dispatch({
					type: 'UPDATE_USER',
					user: response.data[0].user,
				});

				for (let followRelationship of response.data) {
					rssFeeds.push(followRelationship.rss);
					rssFeedFollowRelationships.push({
						rssFeedID: followRelationship.rss._id,
						userID: followRelationship.user._id,
					});
				}

				this.props.dispatch({
					rssFeeds,
					type: 'BATCH_UPDATE_RSS_FEEDS',
				});

				this.props.dispatch({
					rssFeedFollowRelationships,
					type: 'BATCH_FOLLOW_RSS_FEEDS',
				});
			})
			.catch(err => {
				console.log(err); // eslint-disable-line no-console
			});
	}

	followRssFeed(rssFeedID) {
		// optimistic dispatch
		this.props.dispatch({
			rssFeedID: rssFeedID,
			type: 'FOLLOW_RSS_FEED',
			userID: localStorage['authedUser'],
		});
		fetch(
			'post',
			'/follows',
			{},
			{
				rss: rssFeedID,
				type: 'rss',
			},
		).catch(err => {
			console.log(err); // eslint-disable-line no-console
			this.props.dispatch({
				rssFeedID: rssFeedID,
				type: 'UNFOLLOW_RSS_FEED',
				userID: localStorage['authedUser'],
			});
		});
	}
	unfollowRssFeed(rssFeedID) {
		// optimistic dispatch
		this.props.dispatch({
			rssFeedID: rssFeedID,
			type: 'UNFOLLOW_RSS_FEED',
			userID: localStorage['authedUser'],
		});
		fetch(
			'delete',
			'/follows',
			{},
			{
				rss: rssFeedID,
				type: 'rss',
			},
		).catch(err => {
			console.log(err); // eslint-disable-line no-console
			this.props.dispatch({
				rssFeedID: rssFeedID,
				type: 'FOLLOW_RSS_FEED',
				userID: localStorage['authedUser'],
			});
		});
	}

	render() {
		return (
			<Panel headerText="Suggested Feeds">
				{this.props.rssFeeds.map(rssFeed => {
					return (
						<Link key={rssFeed._id} to={`/rss/${rssFeed._id}`}>
							<Img
								src={[
									rssFeed.images.favicon,
									getPlaceholderImageURL(rssFeed._id),
								]}
							/>
							<div>{rssFeed.title}</div>
							<div
								className={`clickable ${
									this.props.followedRssFeeds[rssFeed._id]
										? 'active'
										: ''
								}`}
								onClick={e => {
									e.preventDefault();
									if (this.props.followedRssFeeds[rssFeed._id]) {
										this.unfollowRssFeed(rssFeed._id);
									} else {
										this.followRssFeed(rssFeed._id);
									}
								}}
							>
								Follow
							</div>
						</Link>
					);
				})}
			</Panel>
		);
	}
}

SuggestedFeeds.defaultProps = {
	followedRssFeeds: {},
	rssFeeds: [],
};

SuggestedFeeds.propTypes = {
	dispatch: PropTypes.func.isRequired,
	followedRssFeeds: PropTypes.shape(),
	rssFeeds: PropTypes.arrayOf(PropTypes.shape),
};

const mapStateToProps = (state, ownProps) => {
	let rssFeeds = [];
	if (state.suggestedRssFeeds) {
		for (let rssFeedID of state.suggestedRssFeeds) {
			rssFeeds.push(state.rssFeeds[rssFeedID]);
		}
	}

	let followedRssFeeds = {};
	if (state.followedRssFeeds && state.followedRssFeeds[localStorage['authedUser']]) {
		followedRssFeeds = { ...state.followedRssFeeds[localStorage['authedUser']] };
	}

	return {
		...ownProps,
		followedRssFeeds,
		rssFeeds,
	};
};

export default connect(mapStateToProps)(SuggestedFeeds);
