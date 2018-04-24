import Loader from './Loader';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import fetch from '../util/fetch';
import moment from 'moment';
import ArticleListItem from './ArticleListItem';

class RSSArticleList extends React.Component {
	constructor(props) {
		super(props);
		this.state = { loading: true };
		this.getRSSFeed = this.getRSSFeed.bind(this);
		this.getRSSArticles = this.getRSSArticles.bind(this);
		this.getFollowState = this.getFollowState.bind(this);
		this.handleFollowClick = this.handleFollowClick.bind(this);
	}
	componentDidMount() {
		this.getRSSFeed(this.props.match.params.rssFeedID);
		this.getFollowState(this.props.match.params.rssFeedID);
		this.getRSSArticles(this.props.match.params.rssFeedID);
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
				per_page: 10,
				rss: rssFeedID,
			},
		)
			.then(res => {
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
	handleFollowClick() {
		// if not currently following, optimistic dispatch follow, make post call, then handle error
		if (!this.props.following) {
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
		} else {
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
	}
	render() {
		if (this.state.loading) {
			return <Loader />;
		} else {
			return (
				<div className="rss-article-list-view">
					<div className="rss-article-list-header">
						<h1>{this.props.rssFeed.title}</h1>
						<button
							className={`btn primary alt ${
								this.props.following ? 'hollow' : ''
							}`}
							onClick={this.handleFollowClick}
						>
							{this.props.following ? 'Unfollow' : 'Follow'}
						</button>
					</div>
					<div className="list">
						{this.props.articles.map(article => {
							return (
								<ArticleListItem
									favicon={this.props.rssFeed.favicon}
									key={article._id}
									like={this.props.like}
									pinArticle={() => {
										this.props.pinArticle(article._id);
									}}
									rssFeedID={this.props.match.params.rssFeedID}
									unlike={this.props.unlike}
									unpinArticle={() => {
										this.props.unpinArticle(
											article.pinID,
											article._id,
										);
									}}
									{...article}
								/>
							);
						})}
						{this.props.articles.length === 0 ? (
							<div>
								<p>
									{
										'We haven\'t found any articles for this RSS feed yet :('
									}
								</p>
								<p>
									{
										'It might be because the RSS feed doesn\'t have any articles, or because it just got added and we\'re still parsing them. Come check back in a few minutes?'
									}
								</p>
								<p>
									{
										'If you\'re pretty sure there\'s supposed to be some articles here, and they aren\'t showing up, send us an email at '
									}
									<a href="mailto:winds@getstream.io">
										winds@getstream.io
									</a>.
								</p>
							</div>
						) : null}
					</div>
				</div>
			);
		}
	}
}

RSSArticleList.defaultProps = {
	articles: [],
	following: false,
	loading: true,
};

RSSArticleList.propTypes = {
	articles: PropTypes.array,
	dispatch: PropTypes.func.isRequired,
	following: PropTypes.bool,
	like: PropTypes.func.isRequired,
	loading: PropTypes.bool,
	match: PropTypes.shape({
		params: PropTypes.shape({
			rssFeedID: PropTypes.string.isRequired,
		}),
	}),
	pinArticle: PropTypes.func.isRequired,
	rssFeed: PropTypes.shape({
		favicon: PropTypes.string,
		title: PropTypes.string,
	}),
	unlike: PropTypes.func.isRequired,
	unpinArticle: PropTypes.func.isRequired,
};

const mapStateToProps = (state, ownProps) => {
	let articles = [];
	let loading = false;
	if (state.articles) {
		articles = Object.values(state.articles).filter(article => {
			return article.rss === ownProps.match.params.rssFeedID;
		});
	} else {
		loading = true;
	}

	let rssFeed = {};

	if ('rssFeeds' in state && ownProps.match.params.rssFeedID in state.rssFeeds) {
		rssFeed = state.rssFeeds[ownProps.match.params.rssFeedID];
	}

	for (let article of articles) {
		// attach pinned state
		if (state.pinnedArticles && state.pinnedArticles[article._id]) {
			article.pinned = true;
			article.pinID = state.pinnedArticles[article._id]._id;
		} else {
			article.pinned = false;
		}
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
const mapDispatchToProps = dispatch => {
	return {
		dispatch,
		like: articleID => {
			// optimistic dispatch
			dispatch({
				objectID: articleID,
				objectType: 'article',
				type: 'LIKE',
			});

			fetch('POST', '/likes', {
				article: articleID,
				user: localStorage['user'],
			}).catch(err => {
				// rollback on failure
				dispatch({
					objectID: articleID,
					objectType: 'article',
					type: 'UNLIKE',
				});

				console.log(err); // eslint-disable-line no-console
			});
		},

		pinArticle: articleID => {
			fetch('POST', '/pins', {
				article: articleID,
			})
				.then(response => {
					dispatch({
						pin: response.data,
						type: 'PIN_ARTICLE',
					});
				})
				.catch(err => {
					console.log(err); // eslint-disable-line no-console
				});
		},

		unlike: articleID => {
			// optimistic dispatch
			dispatch({
				objectID: articleID,
				objectType: 'article',
				type: 'UNLIKE',
			});
			fetch('DELETE', '/likes', null, {
				article: articleID,
			}).catch(err => {
				// rollback if it fails
				dispatch({
					objectID: articleID,
					objectType: 'article',
					type: 'LIKE',
				});

				console.log(err); // eslint-disable-line no-console
			});
		},
		unpinArticle: (pinID, articleID) => {
			fetch('DELETE', `/pins/${pinID}`)
				.then(() => {
					dispatch({
						articleID,
						type: 'UNPIN_ARTICLE',
					});
				})
				.catch(err => {
					console.log(err); // eslint-disable-line no-console
				});
		},
	};
};
const mergeProps = (stateProps, dispatchProps, ownProps) => {
	return {
		...dispatchProps,
		getRSSArticles: rssFeedID => {
			dispatchProps.getRSSArticles(rssFeedID);
		},
		getRSSFeed: rssFeedID => {
			dispatchProps.getRSSFeed(rssFeedID);
		},
		...stateProps,
		...ownProps,
	};
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(RSSArticleList);
