import { Link } from 'react-router-dom';
import getPlaceholderImageURL from '../../util/getPlaceholderImageURL';
import Img from 'react-image';
import React from 'react';
import Panel from '../Panel';
import { getArticle } from '../../selectors';
import { connect } from 'react-redux';
import TimeAgo from '../TimeAgo';
import PropTypes from 'prop-types';
import { getFeed } from '../../util/feeds';

class RecentArticlesPanel extends React.Component {
	componentDidMount() {
		getFeed(this.props.dispatch, 'article', 0, 20);
	}

	render() {
		return (
			<Panel expandable={true} headerLink="/rss" headerText="Recent Articles">
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
			</Panel>
		);
	}
}

RecentArticlesPanel.propTypes = {
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
		articles.push(getArticle(state, articleID.replace('article:', '')));
	}

	return { ...ownProps, articles };
};

export default connect(mapStateToProps)(RecentArticlesPanel);
