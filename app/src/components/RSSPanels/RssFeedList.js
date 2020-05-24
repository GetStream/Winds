import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import getPlaceholderImageURL from '../../util/getPlaceholderImageURL';
import { Img } from 'react-image';
import React from 'react';
import Panel from '../Panel';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

class RssFeedList extends React.Component {
	render() {
		return (
			<Panel
				hasHighlight={
					this.props.match.params.rssFeedID &&
					this.props.match.params.rssFeedID !== 'recent'
				}
				headerLink="/rss"
				headerText="Feeds"
			>
				{this.props.rssFeeds.map((rssFeed) => {
					const favicon = rssFeed.images ? rssFeed.images.favicon : null;
					let rssId = rssFeed.duplicateOf || rssFeed._id;
					let clazz =
						this.props.match.params.rssFeedID === rssFeed._id
							? 'highlighted'
							: '';
					return (
						<Link className={clazz} key={rssId} to={`/rss/${rssId}`}>
							<Img
								loader={<div className="placeholder" />}
								src={[favicon, getPlaceholderImageURL(rssId)]}
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

const mapStateToProps = (state) => {
	if (!state.rssFeeds) return { rssFeeds: [] };

	let rssFeeds = Object.values(state.rssFeeds);
	rssFeeds.sort((a, b) => a.title.localeCompare(b.title));

	if (state.aliases) {
		rssFeeds = rssFeeds.map((rssFeed) => {
			if (state.aliases[rssFeed._id])
				rssFeed.title = state.aliases[rssFeed._id].alias;
			return rssFeed;
		});
	}

	return { rssFeeds };
};

export default withRouter(connect(mapStateToProps)(RssFeedList));
