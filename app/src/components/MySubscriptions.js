import optionsIcon from '../images/icons/options.svg';
import Img from 'react-image';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import React from 'react';
import getPlaceholderImageURL from '../util/getPlaceholderImageURL';
import fetch from '../util/fetch';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

class MySubscriptions extends React.Component {
	componentDidMount() {
		let userID = this.props.match.params.userID || localStorage['authedUser'];
		fetch('GET', `/users/${userID}/following`, null, { type: 'rss' }).then(
			response => {
				for (let followRelationship of response.data) {
					this.props.updateRssFeed(followRelationship.rss);
					this.props.updateUser(followRelationship.user);
					this.props.updateFollowedRssFeed(
						followRelationship.rss._id,
						followRelationship.user._id,
					);
				}
			},
		);
	}
	render() {
		return (
			<div className="my-subscriptions">
				<div className="section-heading">
					<h2>My Subscriptions</h2>
				</div>
				<div className="panel">
					{this.props.rssFeeds.map((rssFeed, i) => {
						return (
							<Link
								className="panel-element"
								key={i}
								to={`/rss/${rssFeed._id}`}
							>
								<div className="left">
									<Img
										src={[
											rssFeed.favicon,
											getPlaceholderImageURL(rssFeed._id),
										]}
									/>
								</div>
								<div className="center">{rssFeed.title}</div>
								<Img className="right" src={optionsIcon} />
							</Link>
						);
					})}
				</div>
			</div>
		);
	}
}

MySubscriptions.defaultProps = {
	rssFeeds: [],
};

MySubscriptions.propTypes = {
	match: PropTypes.shape({
		params: PropTypes.shape({ userID: PropTypes.string }).isRequired,
	}).isRequired,
	rssFeeds: PropTypes.array,
	updateFollowedRssFeed: PropTypes.func.isRequired,
	updateRssFeed: PropTypes.func.isRequired,
	updateUser: PropTypes.func.isRequired,
};

const mapStateToProps = (state, ownProps) => {
	let userID = ownProps.match.params.userID || localStorage['authedUser'];
	let rssFeeds = [];
	if (state.followedRssFeeds && state.followedRssFeeds[userID]) {
		for (var rssFeedID in state.followedRssFeeds[userID]) {
			if (state.followedRssFeeds[userID].hasOwnProperty(rssFeedID)) {
				if (
					state.followedRssFeeds[userID] &&
					state.followedRssFeeds[userID][rssFeedID]
				) {
					rssFeeds.push({ ...state.rssFeeds[rssFeedID] });
				}
			}
		}
	}
	return { ...ownProps, rssFeeds };
};

const mapDispatchToProps = (dispatch, ownProps) => {
	return {
		updateFollowedRssFeed: (rssFeedID, userID) => {
			dispatch({
				rssFeedID,
				type: 'FOLLOW_RSS_FEED',
				userID,
			});
		},
		updateRssFeed: rssFeed => {
			dispatch({ rssFeed, type: 'UPDATE_RSS_FEED' });
		},
		updateUser: user => {
			dispatch({
				type: 'UPDATE_USER',
				user,
			});
		},
		...ownProps,
	};
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(MySubscriptions));
