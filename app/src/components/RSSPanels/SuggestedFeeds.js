import { Link } from 'react-router-dom';
import getPlaceholderImageURL from '../../util/getPlaceholderImageURL';
import Img from 'react-image';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import fetch from '../../util/fetch';
import Panel from '../Panel';
import { getRss, getRssFollows } from '../../api';

class SuggestedFeeds extends React.Component {
	componentDidMount() {
		if (this.props.rssFeeds.length) return;

		getRss(this.props.dispatch);
		getRssFollows(this.props.dispatch);
	}

	followRssFeed(rssFeedID) {
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
		).catch((err) => {
			if (window.console) {
				console.log(err); // eslint-disable-line no-console
			}

			this.props.dispatch({
				rssFeedID: rssFeedID,
				type: 'UNFOLLOW_RSS_FEED',
				userID: localStorage['authedUser'],
			});
		});
	}

	unfollowRssFeed(rssFeedID) {
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
		).catch((err) => {
			if (window.console) {
				console.log(err); // eslint-disable-line no-console
			}

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
				{this.props.rssFeeds.map((rssFeed) => {
					return (
						<Link key={rssFeed._id} to={`/rss/${rssFeed._id}`}>
							<Img
								src={[rssFeed.images.favicon, getPlaceholderImageURL()]}
								loader={<div className="placeholder" />}
							/>
							<div>{rssFeed.title}</div>
							<div
								className={`clickable ${
									this.props.followedRssFeeds[rssFeed._id]
										? 'active'
										: ''
								}`}
								onClick={(e) => {
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
	if (state.aliases) {
		rssFeeds = rssFeeds.map((rssFeed) => {
			if (state.aliases[rssFeed._id])
				rssFeed.title = state.aliases[rssFeed._id].alias;
			return rssFeed;
		});
	}
	return {
		...ownProps,
		followedRssFeeds,
		rssFeeds,
	};
};

export default connect(mapStateToProps)(SuggestedFeeds);
