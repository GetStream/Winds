import { getPinnedArticles } from '../util/pins';
import { getArticle } from '../selectors';
import fetch from '../util/fetch';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import ArticleListItem from './ArticleListItem';
import Waypoint from 'react-waypoint';
import loaderIcon from '../images/loaders/default.svg';
import Img from 'react-image';

class AllArticles extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			cursor: 0,
			reachedEndOfFeed: false,
		};
	}
	componentDidMount() {
		this.getArticleFeed();
		getPinnedArticles(this.props.dispatch);
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
			if (articles.length === 0) {
				this.setState({
					reachedEndOfFeed: true,
				});
			}

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
				<div className="list-view-header content-header">
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
											cursor: this.state.cursor + 1,
										},
										() => {
											this.getArticleFeed();
										},
									);
								}}
							/>
							<div className="end-loader">
								<Img src={loaderIcon} />
							</div>
						</div>
					)}
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
	dispatch: PropTypes.func.isRequired,
	pinArticle: PropTypes.func,
	unpinArticle: PropTypes.func,
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

	return { ...ownProps, articles };
};

export default connect(mapStateToProps)(AllArticles);
