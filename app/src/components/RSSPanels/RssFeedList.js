import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import getPlaceholderImageURL from '../../util/getPlaceholderImageURL';
import Img from 'react-image';
import React from 'react';
import Panel from '../Panel';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getFollows } from '../../api';

class RssFeedList extends React.Component {
	componentDidMount() {
		getFollows(this.props.dispatch, 'rss');
	}

	render() {
		return (
			<Panel
				hasHighlight={
					this.props.match.params.rssFeedID &&
					this.props.match.params.rssFeedID !== 'recent'
				}
				headerText="Feeds"
				headerLink="/rss"
			>
				{this.props.rssFeeds.map(rssFeed => {
					let rssId = rssFeed.duplicateOf || rssFeed._id;
					let clazz =
						this.props.match.params.rssFeedID === rssFeed._id
							? 'highlighted'
							: '';
					return (
						<Link className={clazz} key={rssId} to={`/rss/${rssId}`}>
							<Img
								src={[rssFeed.images.favicon, getPlaceholderImageURL()]}
								loader={<div className="placeholder" />}
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

	if (state.aliases) {
		rssFeeds = rssFeeds.map(rssFeed => {
			if (state.aliases[rssFeed._id])
				rssFeed.title = state.aliases[rssFeed._id].alias;
			return rssFeed;
		});
	}

	rssFeeds.sort((a, b) => {
		return a.title.localeCompare(b.title);
	});

	return {
		...ownProps,
		rssFeeds,
	};
};

export default connect(mapStateToProps)(withRouter(RssFeedList));
