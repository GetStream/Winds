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
			.then(res => {
				this.props.dispatch({
					type: 'UPDATE_USER',
					user: res.data[0].user,
				});

				let rssFeeds = [];
				let rssFeedFollowRelationships = [];
				for (let followRelationship of res.data) {
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
				if (window.console) {
					console.log(err); // eslint-disable-line no-console
				}
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
	let rssFeedsUserFollows = [];

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
