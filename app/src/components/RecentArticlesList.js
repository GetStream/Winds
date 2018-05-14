import { getArticle } from '../selectors';
import ArticleListItem from './ArticleListItem';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

class RecentArticlesList extends React.Component {
	render() {
		return (
			<div className="rss-article-list-view">
				<div className="rss-article-list-header">
					<h1>Recent Articles</h1>
				</div>

				<div className="list">
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
			</div>
		);
	}
}

RecentArticlesList.defaultProps = {
	articles: [],
};

RecentArticlesList.propTypes = {
	articles: PropTypes.arrayOf(PropTypes.shape({})),
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

	return { ...ownProps, articles: articles.slice(0, 20) };
};

export default connect(mapStateToProps)(RecentArticlesList);
