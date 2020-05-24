import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Waypoint } from 'react-waypoint';
import { Img } from 'react-image';
import Popover from 'react-popover';

import fetch from '../util/fetch';
import getPlaceholderImageURL from '../util/getPlaceholderImageURL';
import ArticleListItem from './ArticleListItem';
import AliasModal from './AliasModal';
import FolderPopover from '../components/Folder/FolderPopover';
import Loader from './Loader';
import { followRss, unfollowRss } from '../api';

import { ReactComponent as LoaderIcon } from '../images/loaders/default.svg';
import { ReactComponent as CircleIcon } from '../images/icons/circle.svg';
import { ReactComponent as DotCircleIcon } from '../images/icons/dot-circle.svg';
import { ReactComponent as SettingIcon } from '../images/icons/settings.svg';

class RSSArticleList extends React.Component {
	constructor(props) {
		super(props);

		this.resetState = {
			cursor: 1,
			newArticles: false,
			menuPopover: false,
			aliasModal: false,
			reachedEndOfFeed: false,
			loading: true,
			loadingArticles: true,
			rssFeed: { images: {} },
			articles: [],
		};

		this.state = { ...this.resetState, sortBy: 'latest' };

		this.contentsEl = React.createRef();
	}

	subscribeToStreamFeed(rssFeedID, streamFeedToken) {
		this.unsubscribeFromStreamFeed();

		this.subscription = window.streamClient
			.feed('rss', rssFeedID, streamFeedToken)
			.subscribe(() => this.setState({ newArticles: true }));
	}

	unsubscribeFromStreamFeed() {
		if (this.subscription) this.subscription.cancel();
	}

	componentDidMount() {
		const rssFeedID = this.props.match.params.rssFeedID;

		if (window.streamAnalyticsClient.userData)
			window.streamAnalyticsClient.trackEngagement({
				label: 'viewed_rss_feed',
				content: `rss:${rssFeedID}`,
			});

		this.getRSSFeed(rssFeedID);
		this.getRSSArticles(rssFeedID);
	}

	componentDidUpdate(prevProps) {
		if (prevProps.match.params.rssFeedID !== this.props.match.params.rssFeedID) {
			const rssFeedID = this.props.match.params.rssFeedID;

			window.streamAnalyticsClient.trackEngagement({
				label: 'viewed_rss_feed',
				content: `rss:${rssFeedID}`,
			});

			this.setState({ ...this.resetState }, () => {
				this.getRSSFeed(rssFeedID);
				this.getRSSArticles(rssFeedID);
			});
		}
		if (this.contentsEl.current && localStorage['rss-article-list-scroll-position']) {
			this.contentsEl.current.scrollTop =
				localStorage['rss-article-list-scroll-position'];
			delete localStorage['rss-article-list-scroll-position'];
		}
	}

	componentWillUnmount() {
		this.unsubscribeFromStreamFeed();
	}

	getRSSFeed = (rssFeedID) => {
		this.setState({ loading: true });
		fetch('GET', `/rss/${rssFeedID}`)
			.then((res) => {
				return res.data.duplicateOf
					? fetch('GET', `/rss/${res.data.duplicateOf}`)
					: res;
			})
			.then((res) =>
				this.setState({ rssFeed: res.data, loading: false }, () => {
					this.subscribeToStreamFeed(
						this.state.rssFeed._id,
						this.state.rssFeed.streamToken,
					);
				}),
			)
			.catch((err) => {
				console.log(err); // eslint-disable-line no-console
			});
	};

	uniqueArr = (array) => {
		const seen = {};
		return array.filter((item) =>
			seen.hasOwnProperty(item._id) ? false : (seen[item._id] = true),
		);
	};

	getRSSArticles = (rssFeedID, newFeed = false) => {
		this.setState({ loadingArticles: true });

		fetch(
			'GET',
			'/articles',
			{},
			{
				page: newFeed ? 1 : this.state.cursor,
				per_page: 10,
				rss: rssFeedID,
				sort_by: `publicationDate${
					this.state.sortBy === 'latest' ? ',desc' : ''
				}`,
			},
		)
			.then((res) => {
				this.setState({ loadingArticles: false });
				if (res.data.length === 0) this.setState({ reachedEndOfFeed: true });
				else if (newFeed) this.setState({ articles: res.data, cursor: 1 });
				else
					this.setState((prevState) => ({
						articles: this.uniqueArr([...prevState.articles, ...res.data]),
					}));
			})
			.catch((err) => {
				this.setState({ loadingArticles: false, error: true });
				console.log(err); // eslint-disable-line no-console
			});
	};

	toggleMenuPopover = () => {
		this.setState((prevState) => ({ menuPopover: !prevState.menuPopover }));
	};

	toggleAliasModal = () => {
		this.setState((prevState) => ({ aliasModal: !prevState.aliasModal }));
	};

	setSortBy = (sortBy) => {
		if (this.state.sortBy === sortBy) return this.setState({ menuPopover: false });

		const rssFeedID = this.props.match.params.rssFeedID;
		this.setState(
			{
				articles: [],
				cursor: 1,
				menuPopover: false,
				reachedEndOfFeed: false,
				sortBy,
			},
			() => {
				this.getRSSArticles(rssFeedID);
			},
		);
	};

	render() {
		if (this.state.loading) return <Loader />;

		const dispatch = this.props.dispatch;
		const rssFeed = this.state.rssFeed;
		const isFollowing = this.props.following[rssFeed._id]
			? this.props.following[rssFeed._id]
			: false;
		const title = this.props.aliases[rssFeed._id]
			? this.props.aliases[rssFeed._id].alias
			: rssFeed.title;

		const articles = this.state.articles.map((article) => {
			if (this.props.pinnedArticles[article._id]) {
				article.pinID = this.props.pinnedArticles[article._id]._id;
			} else article.pinID = '';

			if (
				this.props.feeds.article &&
				this.props.feeds.article.indexOf(article._id) < 20 &&
				this.props.feeds.article.indexOf(article._id) !== -1
			) {
				article.recent = true;
			} else article.recent = false;

			return article;
		});

		const menuPopover = (
			<div className="popover-panel feed-popover">
				<div
					className="panel-element menu-item sort-button"
					onClick={() => this.setSortBy('latest')}
				>
					{this.state.sortBy === 'latest' ? <DotCircleIcon /> : <CircleIcon />}
					Latest
				</div>
				<div
					className="panel-element menu-item sort-button"
					onClick={() => this.setSortBy('oldest')}
				>
					{this.state.sortBy === 'oldest' ? <DotCircleIcon /> : <CircleIcon />}
					Oldest
				</div>
				<div className="panel-element menu-item" onClick={this.toggleAliasModal}>
					Rename
				</div>
				<div
					className="panel-element menu-item"
					onClick={() =>
						isFollowing
							? unfollowRss(dispatch, rssFeed._id)
							: followRss(dispatch, rssFeed._id)
					}
				>
					{isFollowing ? <span className="alert">Unfollow</span> : 'Follow'}
				</div>
			</div>
		);

		let rightContents;
		if (this.state.loadingArticles && !articles.length) {
			rightContents = <Loader />;
		} else if (articles.length === 0) {
			rightContents = (
				<div>
					<p>We haven&#39;t found any articles for this RSS feed yet :(</p>
					<p>
						It might be because the RSS feed doesn&#39;t have any articles, or
						because it just got added and we&#39;re still parsing them. Come
						check back in a few minutes?
					</p>
					<p>
						If you&#39;re pretty sure there&#39;s supposed to be some articles
						here, and they aren&#39;t showing up, please file a{' '}
						<a href="https://github.com/getstream/winds/issues">
							GitHub Issue
						</a>
						.
					</p>
				</div>
			);
		} else {
			rightContents = (
				<React.Fragment>
					{articles.map((article) => {
						return (
							<ArticleListItem
								key={article._id}
								onNavigation={() => {
									localStorage[
										'rss-article-list-scroll-position'
									] = this.contentsEl.current.scrollTop;
								}}
								{...article}
							/>
						);
					})}

					{this.state.reachedEndOfFeed ? (
						<div className="end">
							<p>That&#39;s it! No more articles here.</p>
							<p>
								What, did you think that once you got all the way around,
								you&#39;d just be back at the same place that you started?
								Sounds like some real round-feed thinking to me.
							</p>
						</div>
					) : (
						<div>
							<Waypoint
								onEnter={() => {
									this.setState(
										(prevState) => ({ cursor: prevState.cursor + 1 }),
										() => this.getRSSArticles(rssFeed._id),
									);
								}}
							/>
							<div className="end-loader">
								<LoaderIcon />
							</div>
						</div>
					)}
				</React.Fragment>
			);
		}

		return (
			<React.Fragment>
				<div className="list-view-header content-header">
					<div className="alignment-box">
						<div className="image">
							<Img
								src={[
									rssFeed.images.featured,
									rssFeed.images.og,
									getPlaceholderImageURL(rssFeed._id),
								]}
							/>
						</div>
						<h1>{title}</h1>

						<div className="right">
							{!isFollowing && (
								<div
									className="follow"
									onClick={() => followRss(dispatch, rssFeed._id)}
								>
									FOLLOW
								</div>
							)}

							<FolderPopover feedID={rssFeed._id} isRss={true} />

							<Popover
								body={menuPopover}
								isOpen={this.state.menuPopover}
								onOuterAction={this.toggleMenuPopover}
								preferPlace="below"
								tipSize={0.1}
							>
								<div onClick={this.toggleMenuPopover}>
									<SettingIcon />
								</div>
							</Popover>
						</div>
					</div>
				</div>

				<AliasModal
					defVal={title}
					feedID={rssFeed._id}
					isOpen={this.state.aliasModal}
					isRss={true}
					toggleModal={this.toggleAliasModal}
				/>

				<div className="list content" ref={this.contentsEl}>
					{this.state.newArticles && (
						<div
							className="toast"
							onClick={() => {
								this.getRSSArticles(rssFeed._id, true);
								this.setState({ newArticles: false });
							}}
						>
							New Articles Available – Click to Refresh
						</div>
					)}
					{rightContents}
				</div>
			</React.Fragment>
		);
	}
}

RSSArticleList.defaultProps = {
	aliases: {},
	following: {},
	pinnedArticles: {},
	feeds: {},
};

RSSArticleList.propTypes = {
	dispatch: PropTypes.func.isRequired,
	following: PropTypes.shape({}),
	aliases: PropTypes.shape({}),
	pinnedArticles: PropTypes.shape({}),
	feeds: PropTypes.shape({}),
	match: PropTypes.shape({
		params: PropTypes.shape({
			rssFeedID: PropTypes.string.isRequired,
		}),
	}),
};

const mapStateToProps = (state) => ({
	aliases: state.aliases || {},
	following: state.followedRssFeeds || {},
	pinnedArticles: state.pinnedArticles || {},
	feeds: state.feeds || {},
});

export default connect(mapStateToProps)(RSSArticleList);
