import { Route, Switch } from 'react-router-dom';
import RSSArticle from '../components/RSSArticle';
import RSSArticleList from '../components/RSSArticleList';
import React from 'react';
import { connect } from 'react-redux';
import { getRssById } from '../api';
import PropTypes from 'prop-types';
import Tabs from '../components/Tabs';
import RecentArticlesPanel from '../components/RSSPanels/RecentArticlesPanel';
import RssFeedList from '../components/RSSPanels/RssFeedList';
import SuggestedFeeds from '../components/RSSPanels/SuggestedFeeds';
import BookmarkPanel from '../components/BookmarkPanel';
import AllArticlesList from '../components/AllArticlesList';

class RSSFeedsView extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			newRSSModalIsOpen: false,
		};

		this.container = React.createRef();
	}

	componentDidMount() {
		this.container.current.focus();

		if (
			this.props.location.search.includes('featured') &&
			this.props.match.params.rssFeedID
		)
			getRssById(this.props.dispatch, this.props.match.params.rssFeedID);
	}

	componentDidUpdate(prevProps) {
		if (
			this.props.location.search.includes('featured') &&
			this.props.match.params.rssFeedID !== prevProps.match.params.rssFeedID
		)
			getRssById(this.props.dispatch, this.props.match.params.rssFeedID);
	}

	toggleNewRSSModal = () => {
		this.setState((prevState) => ({
			newRSSModalIsOpen: !prevState.newRSSModalIsOpen,
		}));
	};

	render() {
		const featured = this.props.location.search.includes('featured');

		let leftColumn;
		if (featured) {
			leftColumn = (
				<React.Fragment>
					<div className="panels-header">
						<div className="featured-rss">
							<div
								className="hero-card"
								style={{
									backgroundImage: `linear-gradient(to top, black, transparent), url(${this.props.rssFeed.images.featured})`,
								}}
							>
								<h1>{this.props.rssFeed.title}</h1>
								<div className="info">rss</div>
							</div>
						</div>
					</div>
					<div className="panels">
						<label>About {this.props.rssFeed.title}</label>
						<h1>{this.props.rssFeed.description}</h1>
						<div>{this.props.rssFeed.summary}</div>
					</div>
				</React.Fragment>
			);
		} else {
			leftColumn = (
				<Tabs
					componentClass="panels"
					headerClass="panels-header"
					headerComponent={<h1>RSS</h1>}
					tabGroup="rss-view"
				>
					<div tabTitle="All Feeds">
						<RecentArticlesPanel />
						<RssFeedList />
					</div>
					<div tabTitle="Bookmarks">
						<BookmarkPanel type="article" />
					</div>
					<div tabTitle="Suggestions">
						<SuggestedFeeds />
					</div>
				</Tabs>
			);
		}

		return (
			<div
				className={`grid-view rss-view ${featured ? 'featured' : ''}`}
				onKeyDown={(e) => {
					e = e || window.e;
					if (('key' in e && e.key === 'Escape') || e.keyCode === 27)
						this.props.history.goBack();
				}}
				ref={this.container}
				tabIndex="-1"
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
	history: PropTypes.shape({ goBack: PropTypes.func.isRequired }).isRequired,
	location: PropTypes.shape({ search: PropTypes.string }).isRequired,
	match: PropTypes.shape({
		params: PropTypes.shape({
			rssFeedID: PropTypes.string,
		}).isRequired,
	}).isRequired,
	rssFeed: PropTypes.shape({
		_id: PropTypes.string,
		duplicateOf: PropTypes.string,
		description: PropTypes.string,
		featured: PropTypes.bool,
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
