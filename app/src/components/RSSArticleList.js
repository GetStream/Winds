import loaderIcon from '../images/loaders/default.svg';
import Loader from './Loader';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import fetch from '../util/fetch';
import { getPinnedArticles } from '../util/pins';
import { getFeed } from '../util/feeds';
import getPlaceholderImageURL from '../util/getPlaceholderImageURL';
import moment from 'moment';
import ArticleListItem from './ArticleListItem';
import Waypoint from 'react-waypoint';
import Img from 'react-image';

class RSSArticleList extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			articleCursor: 1,
			sortBy: 'latest',
			newArticlesAvailable: false,
		};

		this.getRSSFeed = this.getRSSFeed.bind(this);
		this.getRSSArticles = this.getRSSArticles.bind(this);
		this.getFollowState = this.getFollowState.bind(this);

		this.contentsEl = React.createRef();
	}

	toggleMenu() {
		this.setState({
			menuIsOpen: !this.state.menuIsOpen,
		});
	}

	subscribeToStreamFeed(rssFeedID, streamFeedToken) {
		this.subscription = window.streamClient
			.feed('rss', rssFeedID, streamFeedToken)
			.subscribe(() => {
				this.setState({
					newArticlesAvailable: true,
				});
			});
	}

	unsubscribeFromStreamFeed() {
		this.subscription.cancel();
	}

	componentDidMount() {
		window.streamAnalyticsClient.trackEngagement({
			label: 'viewed_rss_feed',
			content: `rss:${this.props.match.params.rssFeedID}`,
		});

		this.getRSSFeed(this.props.match.params.rssFeedID);
		this.getFollowState(this.props.match.params.rssFeedID);
		this.getRSSArticles(this.props.match.params.rssFeedID);

		getPinnedArticles(this.props.dispatch);
		getFeed(this.props.dispatch, 'article', 0, 20);

		if (this.props.rssFeed) {
			this.subscribeToStreamFeed(
				this.props.rssFeed._id,
				this.props.rssFeed.streamToken,
			);
		}
	}
	componentWillReceiveProps(nextProps) {
		if (nextProps.match.params.rssFeedID !== this.props.match.params.rssFeedID) {
			window.streamAnalyticsClient.trackEngagement({
				label: 'viewed_rss_feed',
				content: `rss:${nextProps.match.params.rssFeedID}`,
			});

			this.setState(
				{
					articleCursor: 1,
				},
				() => {
					this.getRSSFeed(nextProps.match.params.rssFeedID);
					this.getFollowState(nextProps.match.params.rssFeedID);
					this.getRSSArticles(nextProps.match.params.rssFeedID);
					getPinnedArticles(this.props.dispatch);
					getFeed(this.props.dispatch, 'article', 0, 20);
				},
			);

			this.unsubscribeFromStreamFeed();
			this.subscribeToStreamFeed(
				nextProps.rssFeed._id,
				nextProps.rssFeed.streamToken,
			);
		}

		if (!this.props.rssFeed && nextProps.rssFeed) {
			this.subscribeToStreamFeed(
				nextProps.rssFeed._id,
				nextProps.rssFeed.streamToken,
			);
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

	getRSSFeed(rssFeedID) {
		return fetch('GET', `/rss/${rssFeedID}`)
			.then(res => {
				this.props.dispatch({
					rssFeed: res.data,
					type: 'UPDATE_RSS_FEED',
				});
			})
			.catch(err => {
				if (window.console) {
					console.log(err); // eslint-disable-line no-console
				}
			});
	}

	getFollowState(rssFeedID) {
		return fetch(
			'get',
			'/follows',
			{},
			{
				rss: rssFeedID,
				user: localStorage['authedUser'],
			},
		).then(res => {
			for (let followRelationship of res.data) {
				this.props.dispatch({
					rssFeedID: followRelationship.rss._id,
					type: 'FOLLOW_RSS_FEED',
					userID: followRelationship.user._id,
				});
			}
		});
	}

	getRSSArticles(rssFeedID) {
		return fetch(
			'GET',
			'/articles',
			{},
			{
				page: this.state.articleCursor,
				per_page: 10,
				rss: rssFeedID,
				sort_by: 'publicationDate,desc',
			},
		)
			.then(res => {
				if (res.data.length === 0) {
					this.setState({
						reachedEndOfFeed: true,
					});
				}

				this.props.dispatch({
					articles: res.data,
					type: 'BATCH_UPDATE_ARTICLES',
				});
			})
			.catch(err => {
				if (window.console) {
					console.log(err); // eslint-disable-line no-console
				}
			});
	}

	follow() {
		this.props.dispatch({
			rssFeedID: this.props.match.params.rssFeedID,
			type: 'FOLLOW_RSS_FEED',
			userID: localStorage['authedUser'],
		});

		fetch('post', '/follows', null, {
			rss: this.props.match.params.rssFeedID,
			type: 'rss',
		}).catch(err => {
			if (window.console) {
				console.log(err); // eslint-disable-line no-console
			}

			this.props.dispatch({
				rssFeedID: this.props.match.params.rssFeedID,
				type: 'UNFOLLOW_RSS_FEED',
				userID: localStorage['authedUser'],
			});
		});
	}

	unfollow() {
		this.props.dispatch({
			rssFeedID: this.props.match.params.rssFeedID,
			type: 'UNFOLLOW_RSS_FEED',
			userID: localStorage['authedUser'],
		});

		fetch('delete', '/follows', null, {
			rss: this.props.match.params.rssFeedID,
			type: 'rss',
		}).catch(err => {
			if (window.console) {
				console.log(err); // eslint-disable-line no-console
			}

			this.props.dispatch({
				rssFeedID: this.props.match.params.rssFeedID,
				type: 'FOLLOW_RSS_FEED',
				userID: localStorage['authedUser'],
			});
		});
	}

	render() {
		let sortedArticles = [...this.props.articles];
		sortedArticles.sort((a, b) => {
			return (
				moment(b.publicationDate).valueOf() - moment(a.publicationDate).valueOf()
			);
		});

		if (this.props.loading) {
			return <Loader />;
		} else {
			let rightContents;
			if (this.props.articles.length === 0) {
				rightContents = (
					<div>
						<p>{"We haven't found any articles for this RSS feed yet :("}</p>
						<p>
							{
								"It might be because the RSS feed doesn't have any articles, or because it just got added and we're still parsing them. Come check back in a few minutes?"
							}
						</p>
						<p>
							{
								"If you're pretty sure there's supposed to be some articles here, and they aren't showing up, please file a "
							}
							<a href="https://github.com/getstream/winds/issues">
								GitHub Issue
							</a>.
						</p>
					</div>
				);
			} else {
				rightContents = (
					<React.Fragment>
						{sortedArticles.map(article => {
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
								<p>{"That's it! No more articles here."}</p>
								<p>
									{
										"What, did you think that once you got all the way around, you'd just be back at the same place that you started? Sounds like some real round-feed thinking to me."
									}
								</p>
							</div>
						) : (
							<div>
								<Waypoint
									onEnter={() => {
										this.setState(
											{
												articleCursor:
													this.state.articleCursor + 1,
											},
											() => {
												this.getRSSArticles(
													this.props.match.params.rssFeedID,
												);
											},
										);
									}}
								/>
								<div className="end-loader">
									<Img src={loaderIcon} />
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
										this.props.rssFeed.images.featured,
										this.props.rssFeed.images.og,
										getPlaceholderImageURL(this.props.rssFeed._id),
									]}
								/>
							</div>
							<h1>{this.props.rssFeed.title}</h1>
							<div className="menu">
								<div
									onClick={() => {
										if (this.props.following) {
											this.unfollow();
										} else {
											this.follow();
										}
									}}
								>
									{this.props.following ? 'Unfollow' : 'Follow'}
								</div>
							</div>
						</div>
					</div>
					<div className="list content" ref={this.contentsEl}>
						{this.state.newArticlesAvailable ? (
							<div
								className="toast"
								onClick={() => {
									this.getRSSFeed(this.props.match.params.rssFeedID);
									this.getFollowState(
										this.props.match.params.rssFeedID,
									);
									this.getRSSArticles(
										this.props.match.params.rssFeedID,
									);
									getPinnedArticles(this.props.dispatch);
									getFeed(this.props.dispatch, 'article', 0, 20);
									this.setState({
										newArticlesAvailable: false,
									});
								}}
							>
								New Articles Available – Click to Refresh
							</div>
						) : null}
						{rightContents}
					</div>
				</React.Fragment>
			);
		}
	}
}

RSSArticleList.defaultProps = {
	articles: [],
	loading: true,
	following: false,
};

RSSArticleList.propTypes = {
	articles: PropTypes.array,
	dispatch: PropTypes.func.isRequired,
	following: PropTypes.bool,
	match: PropTypes.shape({
		params: PropTypes.shape({
			rssFeedID: PropTypes.string.isRequired,
		}),
	}),
	loading: PropTypes.bool,
	rssFeed: PropTypes.shape({
		_id: PropTypes.string,
		images: PropTypes.shape({
			featured: PropTypes.string,
			og: PropTypes.string,
		}),
		title: PropTypes.string,
		streamToken: PropTypes.string.isRequired,
	}),
};

const mapStateToProps = (state, ownProps) => {
	let rssFeed = { images: {} };

	if ('rssFeeds' in state && ownProps.match.params.rssFeedID in state.rssFeeds) {
		rssFeed = { ...state.rssFeeds[ownProps.match.params.rssFeedID] };
	} else {
		return {
			...ownProps,
			loading: true,
		};
	}

	let following = false;
	if (
		state.followedRssFeeds &&
		state.followedRssFeeds[localStorage['authedUser']] &&
		state.followedRssFeeds[localStorage['authedUser']][
			ownProps.match.params.rssFeedID
		]
	) {
		following = true;
	}

	let articles = [];
	if (state.articles) {
		for (let articleID of Object.keys(state.articles)) {
			if (state.articles[articleID].rss === ownProps.match.params.rssFeedID) {
				articles.push({ ...state.articles[articleID] }); // from @kenhoff - derp, make sure that you're pushing a _copy_ of the object, not the object itself, otherwise redux state is boom :(
			}
		}
	} else {
		return {
			...ownProps,
			loading: true,
		};
	}

	for (let article of articles) {
		if (state.pinnedArticles && state.pinnedArticles[article._id]) {
			article.pinned = true;
			article.pinID = state.pinnedArticles[article._id]._id;
		} else {
			article.pinned = false;
		}

		if (state.feeds && state.feeds[`user_article:${localStorage['authedUser']}`]) {
			if (
				state.feeds[`user_article:${localStorage['authedUser']}`].indexOf(
					article._id,
				) < 20 &&
				state.feeds[`user_article:${localStorage['authedUser']}`].indexOf(
					article._id,
				) !== -1
			) {
				article.recent = true;
			} else {
				article.recent = false;
			}
		}

		article.rss = { ...rssFeed };
	}

	articles.sort((a, b) => {
		return moment(b.publicationDate).valueOf() - moment(a.publicationDate).valueOf();
	});

	return {
		articles,
		following,
		loading: false,
		rssFeed,
		...ownProps,
	};
};

export default connect(mapStateToProps)(RSSArticleList);
