import rssIcon from '../images/icons/rss.svg';
import Img from 'react-image';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import fetch from '../util/fetch';

class ListOfFollowedRSSFeeds extends React.Component {
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
			<div className="panel">
				{this.props.rssFeeds.map(rssFeed => {
					return (
						<Link
							className="panel-element"
							key={rssFeed._id}
							to={`/rss/${rssFeed._id}`}
						>
							<div className="left">
								<Img src={[rssFeed.images.favicon, rssIcon]} />
							</div>
							<div className="center">{rssFeed.title}</div>
						</Link>
					);
				})}
			</div>
		);
	}
}

ListOfFollowedRSSFeeds.propTypes = {
	dispatch: PropTypes.func.isRequired,
	rssFeeds: PropTypes.arrayOf(PropTypes.shape({})),
};

const mapStateToProps = state => {
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
		return state.rssFeeds[rssFeedID];
	});

	rssFeeds.sort((a, b) => {
		return a.title.localeCompare(b.title);
	});
	return {
		rssFeeds,
	};
};

export default connect(mapStateToProps)(ListOfFollowedRSSFeeds);
