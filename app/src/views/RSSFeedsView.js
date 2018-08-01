import { Route, Switch } from 'react-router-dom';
import RSSArticle from '../components/RSSArticle';
import RSSArticleList from '../components/RSSArticleList';
import React from 'react';
import { connect } from 'react-redux';
import fetch from '../util/fetch';
import PropTypes from 'prop-types';
import Tabs from '../components/Tabs';
import RecentArticlesPanel from '../components/RSSPanels/RecentArticlesPanel';
import RssFeedList from '../components/RSSPanels/RssFeedList';
import SuggestedFeeds from '../components/RSSPanels/SuggestedFeeds';
import BookmarkedArticles from '../components/RSSPanels/BookmarkedArticles';
import AllArticlesList from '../components/AllArticlesList';

class RSSFeedsView extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			newRSSModalIsOpen: false,
			selectedTab: localStorage['selectedRSSTab'] || 'all',
		};

		this.toggleNewRSSModal = this.toggleNewRSSModal.bind(this);
	}

	componentDidMount() {
		if (!this.props.match.params.rssFeedID) {
			return;
		}
		this.fetchRSS(this.props);
	}

	fetchRSS(props) {
		return fetch('get', `/rss/${props.match.params.rssFeedID}`).then(res => {
			if (res.data.duplicateOf) {
				return fetch('GET', `/rss/${res.data.duplicateOf}`);
			}
			return res;
		}).then(response => {
			this.props.dispatch({ rssFeed: response.data, type: 'UPDATE_RSS_FEED' });
		});
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.match.params.rssFeedID === nextProps.match.params.rssFeedID) {
			return;
		}
		this.fetchRSS(nextProps);
	}

	toggleNewRSSModal() {
		this.setState({ newRSSModalIsOpen: !this.state.newRSSModalIsOpen });
	}

	render() {
		let leftColumn;
		if (new URLSearchParams(this.props.location.search).get('featured') === 'true') {
			leftColumn = (
				<React.Fragment>
					<div className="panels-header">
						<div className="featured-rss">
							<div
								className="hero-card"
								style={{
									backgroundImage: `linear-gradient(to top, black, transparent), url(${
										this.props.rssFeed.images.featured
									})`,
								}}
							>
								<h1>{this.props.rssFeed.title}</h1>
								<div className="info">rss</div>
							</div>
						</div>
					</div>
					<div className="panels featured-description">
						<label>About {this.props.rssFeed.title}</label>
						<h1>{this.props.rssFeed.description}</h1>
						<div>{this.props.rssFeed.summary}</div>
					</div>
				</React.Fragment>
			);
		} else {
			let headerComponent = <h1>RSS</h1>;

			leftColumn = (
				<Tabs
					componentClass="panels"
					headerClass="panels-header"
					headerComponent={headerComponent}
					tabGroup="rss-view"
				>
					<div tabTitle="All Feeds">
						<RecentArticlesPanel />
						<RssFeedList />
					</div>
					<div tabTitle="Bookmarks">
						<BookmarkedArticles />
					</div>
					<div tabTitle="Suggestions">
						<SuggestedFeeds />
					</div>
				</Tabs>
			);
		}

		return (
			<div
				className={`rss-view ${
					new URLSearchParams(this.props.location.search).get('featured') ===
					'true'
						? 'featured'
						: ''
				}`}
			>
				{leftColumn}
				<div className="border" />
				<Switch>
					<Route
						component={RSSArticle}
						path="/rss/:rssFeedID/articles/:articleID"
					/>
					<Route component={RSSArticleList} path="/rss/:rssFeedID" />
					<Route component={AllArticlesList} path="/rss" />
				</Switch>
			</div>
		);
	}
}

RSSFeedsView.defaultProps = {
	rssFeed: {
		images: {},
	},
};

RSSFeedsView.propTypes = {
	dispatch: PropTypes.func.isRequired,
	match: PropTypes.shape({
		params: PropTypes.shape({
			rssFeedID: PropTypes.string,
		}).isRequired,
	}).isRequired,
	rssFeed: PropTypes.shape({
		_id: PropTypes.string,
		duplicateOf: PropTypes.string,
		description: PropTypes.string,
		featured: PropTypes.boolean,
		images: PropTypes.shape({
			featured: PropTypes.string,
		}),
		summary: PropTypes.string,
		title: PropTypes.string,
	}),
};

const mapStateToProps = (state, ownProps) => {
	if (ownProps.match.params.rssFeedID && state.rssFeeds) {
		return {
			...ownProps,
			rssFeed: state.rssFeeds[ownProps.match.params.rssFeedID],
		};
	} else {
		return { ...ownProps };
	}
};

export default connect(mapStateToProps)(RSSFeedsView);
