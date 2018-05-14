import { Link } from 'react-router-dom';
import getPlaceholderImageURL from '../../util/getPlaceholderImageURL';
import Img from 'react-image';
import React from 'react';
import Panel from '../Panel';
import { getArticle } from '../../selectors';
import { connect } from 'react-redux';
import fetch from '../../util/fetch';
import TimeAgo from '../TimeAgo';
import PropTypes from 'prop-types';

class RecentArticlesPanel extends React.Component {
	componentDidMount() {
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
			<Panel>
				<Panel.Header to="/rss/recent">Recent Articles</Panel.Header>
				<Panel.Contents>
					{this.props.articles.slice(0, 20).map(article => {
						return (
							<Link
								key={article._id}
								to={`/rss/${article.rss._id}/articles/${article._id}`}
							>
								<Img
									src={[
										article.rss.images.favicon,
										getPlaceholderImageURL(article.rss._id),
									]}
								/>
								<div>{article.title}</div>
								<TimeAgo
									className="muted"
									timestamp={article.publicationDate}
									trim={true}
								/>
							</Link>
						);
					})}
				</Panel.Contents>
			</Panel>
		);
	}
}

RecentArticlesPanel.propTypes = {
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

	return { ...ownProps, articles };
};

export default connect(mapStateToProps)(RecentArticlesPanel);
