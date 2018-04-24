import {
	EverythingRSSPanel,
	FollowSuggestionsRSSPanel,
	PinsRSSPanel,
	TodayRSSPanel,
} from './RSSPanels';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import fetch from '../util/fetch';

class RSSPanelsContainer extends React.Component {
	constructor(props) {
		super(props);
		this.getFollowedRssFeeds = this.getFollowedRssFeeds.bind(this);
	}
	componentDidMount() {
		this.props.getArticleFeed();
		this.props.getSuggestedPodcasts();
		this.props.getPinnedArticles();
		this.getFollowedRssFeeds();
	}
	getFollowedRssFeeds() {
		fetch('get', '/follows', null, {
			type: 'rss',
			user: localStorage['authedUser'],
		})
			.then(response => {
				for (let followRelationship of response.data) {
					// update rss feed
					this.props.dispatch({
						rssFeed: followRelationship.rss,
						type: 'UPDATE_RSS_FEED',
					});
					// update user
					this.props.dispatch({
						type: 'UPDATE_USER',
						user: followRelationship.user,
					});
					// update follow relationship
					this.props.dispatch({
						rssFeedID: followRelationship.rss._id,
						type: 'FOLLOW_RSS_FEED',
						userID: followRelationship.user._id,
					});
				}
			})
			.catch(err => {
				console.log(err); // eslint-disable-line no-console
			});
	}
	render() {
		return (
			<div>
				<FollowSuggestionsRSSPanel
					followedRssFeeds={this.props.followedRssFeeds}
					suggestions={this.props.suggestedRSSFeeds}
				/>
				<TodayRSSPanel articles={this.props.articles} />
				<PinsRSSPanel
					pins={this.props.pinnedArticles}
					unpinArticle={this.props.unpinArticle}
				/>
				<EverythingRSSPanel articles={this.props.articles} />
			</div>
		);
	}
}

RSSPanelsContainer.defaultProps = {
	articles: [],
	followedRssFeeds: {},
	pinnedArticles: [],
	suggestedRSSFeeds: [],
};

RSSPanelsContainer.propTypes = {
	articles: PropTypes.arrayOf(PropTypes.shape({})),
	dispatch: PropTypes.func.isRequired,
	followedRssFeeds: PropTypes.shape({}),
	getArticleFeed: PropTypes.func.isRequired,
	getPinnedArticles: PropTypes.func.isRequired,
	getSuggestedPodcasts: PropTypes.func.isRequired,
	pinnedArticles: PropTypes.arrayOf(PropTypes.shape({})),
	suggestedRSSFeeds: PropTypes.arrayOf(PropTypes.shape({})),
	unpinArticle: PropTypes.func.isRequired,
};

const mapStateToProps = (state, ownProps) => {
	let pinnedArticles = [];
	for (var articleID in state.pinnedArticles) {
		if (state.pinnedArticles.hasOwnProperty(articleID)) {
			if (state.pinnedArticles[articleID]) {
				let pin = { ...state.pinnedArticles[articleID] };
				pin.article = { ...state.articles[articleID] };
				pin.article.rss = { ...state.rssFeeds[pin.article.rss] };
				pinnedArticles.push(pin);
			}
		}
	}
	let suggestedRSSFeeds = [];
	if (state.suggestedRssFeeds) {
		for (let rssFeedID of state.suggestedRssFeeds) {
			suggestedRSSFeeds.push(state.rssFeeds[rssFeedID]);
		}
	}

	let articles = [];
	if (state.feeds && state.feeds[`user_article:${localStorage['authedUser']}`]) {
		for (let articleID of state.feeds[`user_article:${localStorage['authedUser']}`]) {
			// also get RSS feed
			let article = {
				...state.articles[articleID.split(':')[1]],
			};
			article.rss = state.rssFeeds[article.rss];

			articles.push(article);
		}
	}

	let followedRssFeeds = {};
	if (state.followedRssFeeds && state.followedRssFeeds[localStorage['authedUser']]) {
		followedRssFeeds = { ...state.followedRssFeeds[localStorage['authedUser']] };
	}

	return {
		...ownProps,
		articles,
		followedRssFeeds,
		pinnedArticles,
		suggestedRSSFeeds,
	};
};

const mapDispatchToProps = (dispatch, ownProps) => {
	return {
		dispatch,
		getArticleFeed: () => {
			fetch('GET', `/users/${localStorage['authedUser']}/feeds`, null, {
				type: 'article',
			}).then(response => {
				let articles = response.data.map(article => {
					return { ...article, type: 'article' };
				});

				for (let article of articles) {
					// update rss feed
					dispatch({
						rssFeed: article.rss,
						type: 'UPDATE_RSS_FEED',
					});
					// update article
					dispatch({
						rssArticle: article,
						type: 'UPDATE_ARTICLE',
					});
				}

				// sort articles
				articles.sort((a, b) => {
					return (
						new Date(b.publicationDate).valueOf() -
						new Date(a.publicationDate).valueOf()
					);
				});

				dispatch({
					activities: articles,
					feedID: `user_article:${localStorage['authedUser']}`,
					type: 'UPDATE_FEED',
				});
			});
		},
		getPinnedArticles: () => {
			fetch('GET', '/pins', null, {
				type: 'article',
				user: localStorage['authedUser'],
			}).then(response => {
				for (let pin of response.data) {
					// dispatch update to rss feeds
					dispatch({
						rssFeed: pin.article.rss,
						type: 'UPDATE_RSS_FEED',
					});
					// dispatch updates to articles
					dispatch({
						rssArticle: { ...pin.article, type: 'article' },
						type: 'UPDATE_ARTICLE',
					});
					// dispatch updates to pins
					dispatch({
						pin,
						type: 'PIN_ARTICLE',
					});
				}
			});
		},

		getSuggestedPodcasts: () => {
			fetch('get', '/rss', {}, { type: 'recommended' })
				.then(response => {
					for (let rssFeed of response.data) {
						// first, update each rss feed object
						dispatch({
							rssFeed,
							type: 'UPDATE_RSS_FEED',
						});
					}
					// then, update the `suggestedRssFeeds` field
					dispatch({
						rssFeeds: response.data,
						type: 'UPDATE_SUGGESTED_RSS_FEEDS',
					});
				})
				.catch(err => {
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

		...ownProps,
	};
};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
	return {
		...ownProps,
		...dispatchProps,
		...stateProps,
	};
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(
	RSSPanelsContainer,
);
