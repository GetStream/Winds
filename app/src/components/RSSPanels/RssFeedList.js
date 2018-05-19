import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import getPlaceholderImageURL from '../../util/getPlaceholderImageURL';
import Img from 'react-image';
import React from 'react';
import Panel from '../Panel';
import fetch from '../../util/fetch';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

class RssFeedList extends React.Component {
	componentDidMount() {
		fetch('GET', '/follows', null, { type: 'rss' })
			.then(response => {
				for (let followRelationship of response.data) {
					// update user
					this.props.dispatch({
						type: 'UPDATE_USER',
						user: followRelationship.user,
					});

					// update rss feed
					this.props.dispatch({
						rssFeed: followRelationship.rss,
						type: 'UPDATE_RSS_FEED',
					});
					// set user to follow rss feed
					this.props.dispatch({
						rssFeedID: followRelationship.rss._id,
						type: 'FOLLOW_RSS_FEED',
						userID: followRelationship.user._id,
					});
				}
			})
			.catch(err => {
				console.log(err); // eslint-disable-line no-console
			});
	}
	render() {
		return (
			<Panel
				hasHighlight={
					this.props.match.params.rssFeedID &&
					this.props.match.params.rssFeedID !== 'recent'
				}
				headerText="Feeds"
			>
				{this.props.rssFeeds.map(rssFeed => {
					return (
						<Link
							className={
								this.props.match.params.rssFeedID === rssFeed._id
									? 'highlighted'
									: ''
							}
							key={rssFeed._id}
							to={`/rss/${rssFeed._id}`}
						>
							<Img
								src={[
									rssFeed.images.favicon,
									getPlaceholderImageURL(rssFeed._id),
								]}
							/>
							<div>{rssFeed.title}</div>
							<div>
								<i className="fa fa-chevron-right" />
							</div>
						</Link>
					);
				})}
			</Panel>
		);
	}
}

RssFeedList.propTypes = {
	dispatch: PropTypes.func.isRequired,
	match: PropTypes.shape({
		params: PropTypes.shape({
			rssFeedID: PropTypes.string,
		}),
	}),
	rssFeeds: PropTypes.arrayOf(PropTypes.shape({})),
};

const mapStateToProps = (state, ownProps) => {
	// convert rssFeeds object into array

	let rssFeedsUserFollows = [];
	// get all the podcast IDs for podcasts that I follow
	if (state.followedRssFeeds && state.followedRssFeeds[localStorage['authedUser']]) {
		for (let rssFeedID of Object.keys(
			state.followedRssFeeds[localStorage['authedUser']],
		)) {
			if (state.followedRssFeeds[localStorage['authedUser']][rssFeedID]) {
				rssFeedsUserFollows.push(rssFeedID);
			}
		}
	}

	let rssFeeds = rssFeedsUserFollows.map(rssFeedID => {
		return { ...state.rssFeeds[rssFeedID] };
	});

	rssFeeds.sort((a, b) => {
		return a.title.localeCompare(b.title);
	});
	return {
		...ownProps,
		rssFeeds,
	};
};

export default connect(mapStateToProps)(withRouter(RssFeedList));
