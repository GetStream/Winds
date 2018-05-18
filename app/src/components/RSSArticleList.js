import loaderIcon from '../images/loaders/default.svg';
import optionsIcon from '../images/icons/options.svg';
import Loader from './Loader';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import fetch from '../util/fetch';
import { getPinnedArticles } from '../util/pins';
import getPlaceholderImageURL from '../util/getPlaceholderImageURL';
import moment from 'moment';
import ArticleListItem from './ArticleListItem';
import Waypoint from 'react-waypoint';
import Img from 'react-image';
import Popover from 'react-popover';

class RSSArticleList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			articleCursor: 1,
			loading: true,
			menuIsOpen: false,
			sortBy: 'latest',
		};
		this.getRSSFeed = this.getRSSFeed.bind(this);
		this.getRSSArticles = this.getRSSArticles.bind(this);
		this.getFollowState = this.getFollowState.bind(this);
		this.toggleMenu = this.toggleMenu.bind(this);
	}

	toggleMenu() {
		this.setState({
			menuIsOpen: !this.state.menuIsOpen,
		});
	}

	componentDidMount() {
		this.getRSSFeed(this.props.match.params.rssFeedID);
		this.getFollowState(this.props.match.params.rssFeedID);
		this.getRSSArticles(this.props.match.params.rssFeedID);
		getPinnedArticles(this.props.dispatch);
	}
	componentWillReceiveProps(nextProps) {
		if (nextProps.match.params.rssFeedID !== this.props.match.params.rssFeedID) {
			this.getRSSFeed(nextProps.match.params.rssFeedID);
			this.getFollowState(nextProps.match.params.rssFeedID);
			this.getRSSArticles(nextProps.match.params.rssFeedID);
		}
	}
	getRSSFeed(rssFeedID) {
		fetch('GET', `/rss/${rssFeedID}`)
			.then(res => {
				this.props.dispatch({
					rssFeed: res.data,
					type: 'UPDATE_RSS_FEED',
				});
			})
			.catch(err => {
				console.log(err); // eslint-disable-line no-console
			});
	}
	getFollowState(rssFeedID) {
		fetch(
			'get',
			'/follows',
			{},
			{
				rss: rssFeedID,
				user: localStorage['authedUser'],
			},
		).then(response => {
			for (let followRelationship of response.data) {
				this.props.dispatch({
					rssFeedID: followRelationship.rss._id,
					type: 'FOLLOW_RSS_FEED',
					userID: followRelationship.user._id,
				});
			}
		});
	}
	getRSSArticles(rssFeedID) {
		// get rss articles
		fetch(
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

				for (let rssArticle of res.data) {
					this.props.dispatch({
						rssArticle,
						type: 'UPDATE_ARTICLE',
					});
				}
				this.setState({
					loading: false,
				});
			})
			.catch(err => {
				console.log(err); // eslint-disable-line no-console
				this.setState({
					loading: false,
				});
			});
	}
	follow() {
		// if not currently following, optimistic dispatch follow, make post call, then handle error
		this.props.dispatch({
			rssFeedID: this.props.match.params.rssFeedID,
			type: 'FOLLOW_RSS_FEED',
			userID: localStorage['authedUser'],
		});
		fetch('post', '/follows', null, {
			rss: this.props.match.params.rssFeedID,
			type: 'rss',
		}).catch(error => {
			console.log(error); // eslint-disable-line no-console
			this.props.dispatch({
				rssFeedID: this.props.match.params.rssFeedID,
				type: 'UNFOLLOW_RSS_FEED',
				userID: localStorage['authedUser'],
			});
		});
	}
	unfollow() {
		// if currently following, optimistic dispatch unfollow, make delete call, then handle error
		this.props.dispatch({
			rssFeedID: this.props.match.params.rssFeedID,
			type: 'UNFOLLOW_RSS_FEED',
			userID: localStorage['authedUser'],
		});
		fetch('delete', '/follows', null, {
			rss: this.props.match.params.rssFeedID,
			type: 'rss',
		}).catch(error => {
			console.log(error); // eslint-disable-line no-console
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

		let menuContent = (
			<div className="podcast-episode-list-view-popover">
				<div className="panel">
					<div
						className="panel-element"
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
		);

		if (this.state.loading) {
			return <Loader />;
		} else {
			let rightContents;
			if (this.props.articles.length === 0) {
				rightContents = (
					<div>
						<p>{'We haven\'t found any articles for this RSS feed yet :('}</p>
						<p>
							{
								'It might be because the RSS feed doesn\'t have any articles, or because it just got added and we\'re still parsing them. Come check back in a few minutes?'
							}
						</p>
						<p>
							{
								'If you\'re pretty sure there\'s supposed to be some articles here, and they aren\'t showing up, please file a '
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
							return <ArticleListItem key={article._id} {...article} />;
						})}

						{this.state.reachedEndOfFeed ? (
							<div className="end">
								<p>{'That\'s it! No more articles here.'}</p>
								<p>
									{
										'What, did you think that once you got all the way around, you\'d just be back at the same place that you started? Sounds like some real round-feed thinking to me.'
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
								<Popover
									body={menuContent}
									isOpen={this.state.menuIsOpen}
									onOuterAction={this.toggleMenu}
									place="below"
								>
									<div onClick={this.toggleMenu}>
										<Img src={optionsIcon} />
									</div>
								</Popover>
							</div>
						</div>
					</div>
					<div className="list content">{rightContents}</div>
				</React.Fragment>
			);
		}
	}
}

RSSArticleList.defaultProps = {
	articles: [],
	following: false,
	rssFeed: {
		images: {},
	},
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
	rssFeed: PropTypes.shape({
		_id: PropTypes.string,
		images: PropTypes.shape({
			featured: PropTypes.string,
			og: PropTypes.string,
		}),
		title: PropTypes.string,
	}),
};

const mapStateToProps = (state, ownProps) => {
	let articles = [];
	let loading = false;
	if (state.articles) {
		for (let articleID of Object.keys(state.articles)) {
			if (state.articles[articleID].rss === ownProps.match.params.rssFeedID) {
				articles.push({ ...state.articles[articleID] }); // from @kenhoff - derp, make sure that you're pushing a _copy_ of the object, not the object itself, otherwise redux state is boom :(
			}
		}
	} else {
		loading = true;
	}

	let rssFeed = { images: {} };

	if ('rssFeeds' in state && ownProps.match.params.rssFeedID in state.rssFeeds) {
		rssFeed = { ...state.rssFeeds[ownProps.match.params.rssFeedID] };
	}

	for (let article of articles) {
		// attach pinned state
		if (state.pinnedArticles && state.pinnedArticles[article._id]) {
			article.pinned = true;
			article.pinID = state.pinnedArticles[article._id]._id;
		} else {
			article.pinned = false;
		}
		article.rss = { ...rssFeed };
	}

	articles.sort((a, b) => {
		return moment(b.publicationDate).valueOf() - moment(a.publicationDate).valueOf();
	});

	let following = false;
	// get follow state for rss feed
	if (
		state.followedRssFeeds &&
		state.followedRssFeeds[localStorage['authedUser']] &&
		state.followedRssFeeds[localStorage['authedUser']][
			ownProps.match.params.rssFeedID
		]
	) {
		following = true;
	}

	return {
		articles,
		following,
		loading,
		rssFeed,
		...ownProps,
	};
};

export default connect(mapStateToProps)(RSSArticleList);
