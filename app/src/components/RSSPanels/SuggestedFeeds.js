import { Link } from 'react-router-dom';
import getPlaceholderImageURL from '../../util/getPlaceholderImageURL';
import { Img } from 'react-image';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import Panel from '../Panel';
import { getSuggestedRss, followRss, unfollowRss } from '../../api';

class SuggestedFeeds extends React.Component {
	componentDidMount() {
		if (!this.props.suggestedRssFeeds.length) getSuggestedRss(this.props.dispatch);
	}

	render() {
		return (
			<Panel headerText="Suggested Feeds">
				{this.props.suggestedRssFeeds.map((rssFeed) => {
					const id = rssFeed._id;
					const favicon = rssFeed.images ? rssFeed.images.favicon : null;
					return (
						<Link key={id} to={`/rss/${id}`}>
							<Img src={[favicon, getPlaceholderImageURL(id)]} />
							<div>{rssFeed.title}</div>
							<div
								className={`clickable ${
									rssFeed.isFollowed ? 'active' : ''
								}`}
								onClick={(e) => {
									e.preventDefault();
									rssFeed.isFollowed
										? unfollowRss(this.props.dispatch, id)
										: followRss(this.props.dispatch, id);
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
	suggestedRssFeeds: [],
};

SuggestedFeeds.propTypes = {
	dispatch: PropTypes.func.isRequired,
	suggestedRssFeeds: PropTypes.arrayOf(PropTypes.shape()),
};

const mapStateToProps = (state) => {
	if (!state.suggestedRssFeeds) return { suggestedRssFeeds: [] };

	let suggestedRssFeeds = state.suggestedRssFeeds;

	if (state.followedRssFeeds) {
		suggestedRssFeeds = suggestedRssFeeds.map((item) => ({
			...item,
			isFollowed: !!state.followedRssFeeds[item._id],
		}));
	}
	if (state.aliases) {
		suggestedRssFeeds = suggestedRssFeeds.map((item) => {
			if (state.aliases[item._id]) item.title = state.aliases[item._id].alias;
			return item;
		});
	}

	return {
		suggestedRssFeeds,
	};
};

export default connect(mapStateToProps)(SuggestedFeeds);
