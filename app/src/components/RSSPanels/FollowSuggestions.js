import rssIcon from '../../images/icons/rss.svg';
import React, { Component } from 'react';
import Img from 'react-image';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import fetch from '../../util/fetch';

class FollowSuggestionsRSSPanel extends Component {
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
		if (this.props.suggestions.length === 0) {
			return null;
		} else {
			return (
				<div className="panel follow-suggestions">
					<div className="panel-header">Follow Suggestions</div>
					{this.props.suggestions.map((suggestion, i) => {
						return (
							<Link
								className="panel-element"
								key={i}
								to={`/rss/${suggestion._id}`}
							>
								<div className="left">
									<Img src={[suggestion.images.favicon, rssIcon]} />
								</div>
								<div className="center">{suggestion.title}</div>
								<div
									className={`right clickable ${
										this.props.followedRssFeeds[suggestion._id]
											? 'active'
											: ''
									}`}
									onClick={e => {
										e.preventDefault();
										if (this.props.followedRssFeeds[suggestion._id]) {
											this.unfollowRssFeed(suggestion._id);
										} else {
											this.followRssFeed(suggestion._id);
										}
									}}
								>
									Follow
								</div>
							</Link>
						);
					})}
				</div>
			);
		}
	}
}

FollowSuggestionsRSSPanel.defaultProps = {
	suggestions: [],
};

FollowSuggestionsRSSPanel.propTypes = {
	dispatch: PropTypes.func.isRequired,
	followedRssFeeds: PropTypes.shape({}),
	suggestions: PropTypes.arrayOf(PropTypes.shape({})),
};

export default connect()(FollowSuggestionsRSSPanel);
