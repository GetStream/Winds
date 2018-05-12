import { getArticle } from '../selectors';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import ArticleListItem from './ArticleListItem';

class AllArticles extends React.Component {
	render() {
		return (
			<div className="rss-article-list-view">
				<div className="rss-article-list-header">
					<h1>All Articles</h1>
				</div>

				<div className="list">
					{this.props.articles.map(article => {
						return (
							<ArticleListItem
								key={article._id}
								pinArticle={() => {
									this.props.pinArticle(article._id);
								}}
								rssFeedID={this.props.match.params.rssFeedID}
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

AllArticles.defaultProps = {
	articles: [],
};

AllArticles.propTypes = {
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

	return { ...ownProps, articles };
};

export default connect(mapStateToProps)(AllArticles);
