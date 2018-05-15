import { getArticle } from '../selectors';
import fetch from '../util/fetch';

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import ArticleListItem from './ArticleListItem';
import Waypoint from 'react-waypoint';

class AllArticles extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			cursor: 0,
		};
	}
	componentDidMount() {
		this.getArticleFeed();
	}
	getArticleFeed() {
		fetch('GET', `/users/${localStorage['authedUser']}/feeds`, null, {
			page: this.state.cursor,
			per_page: 10,
			sort_by: 'publicationDate,desc',
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
		let unsortedArticles = [...this.props.articles];
		unsortedArticles.sort((a, b) => {
			return (
				new Date(b.publicationDate).valueOf() -
				new Date(a.publicationDate).valueOf()
			);
		});

		return (
			<React.Fragment>
				<div className="rss-article-list-header content-header">
					<h1>All Articles</h1>
				</div>

				<div className="list content">
					{unsortedArticles.map(article => {
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
					<Waypoint
						onEnter={() => {
							this.setState(
								{
									cursor: this.state.cursor + 1,
								},
								() => {
									this.getArticleFeed();
								},
							);
						}}
					/>
				</div>
			</React.Fragment>
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
