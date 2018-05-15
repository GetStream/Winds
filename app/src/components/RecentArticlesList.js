import { getPinnedArticles } from '../util/pins';
import { getArticle } from '../selectors';
import ArticleListItem from './ArticleListItem';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import fetch from '../util/fetch';

class RecentArticlesList extends React.Component {
	componentDidMount() {
		getPinnedArticles(this.props.dispatch);

		fetch('GET', `/users/${localStorage['authedUser']}/feeds`, null, {
			type: 'article',
		}).then(response => {
			let articles = response.data.map(article => {
				return { ...article, type: 'article' };
			});

			for (let article of articles) {
				// update rss feed
				this.props.dispatch({
					rssFeed: article.rss,
					type: 'UPDATE_RSS_FEED',
				});
				// update article
				this.props.dispatch({
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

			this.props.dispatch({
				activities: articles,
				feedID: `user_article:${localStorage['authedUser']}`,
				type: 'UPDATE_FEED',
			});
		});
	}
	render() {
		return (
			<React.Fragment>
				<div className="rss-article-list-header content-header">
					<h1>Recent Articles</h1>
				</div>

				<div className="list content">
					{this.props.articles.map(article => {
						return (
							<ArticleListItem
								key={article._id}
								pinArticle={() => {
									this.props.pinArticle(article._id);
								}}
								unpinArticle={() => {
									this.props.unpinArticle(article.pinID, article._id);
								}}
								{...article}
							/>
						);
					})}
				</div>
			</React.Fragment>
		);
	}
}

RecentArticlesList.defaultProps = {
	articles: [],
};

RecentArticlesList.propTypes = {
	articles: PropTypes.arrayOf(PropTypes.shape({})),
	dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = (state, ownProps) => {
	let articles = [];
	let userArticleFeed = [];
	if (state.feeds && state.feeds[`user_article:${localStorage['authedUser']}`]) {
		userArticleFeed = state.feeds[`user_article:${localStorage['authedUser']}`];
	}
	for (let articleID of userArticleFeed) {
		// need to trim the `episode:` from the episode ID
		articles.push(getArticle(state, articleID.replace('article:', '')));
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

	return { ...ownProps, articles: articles.slice(0, 20) };
};

export default connect(mapStateToProps)(RecentArticlesList);
