import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import ArticleListItem from './ArticleListItem';
import { Waypoint } from 'react-waypoint';
import loaderIcon from '../images/loaders/default.svg';
import { Img } from 'react-image';
import { getFeed } from '../util/feeds';

class AllArticles extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			newArticlesAvailable: false,
			cursor: 0,
			reachedEndOfFeed: false,
		};

		this.contentsEl = React.createRef();
	}

	componentDidMount() {
		this.getArticleFeed();

		this.subscription = window.streamClient
			.feed('user_article', this.props.userID, this.props.userArticleStreamToken)
			.subscribe(() => this.setState({ newArticlesAvailable: true }));
	}

	componentDidUpdate() {
		if (this.contentsEl.current && localStorage['all-article-list-scroll-position']) {
			this.contentsEl.current.scrollTop =
				localStorage['all-article-list-scroll-position'];
			delete localStorage['all-article-list-scroll-position'];
		}
	}

	componentWillUnmount() {
		this.subscription.cancel();
	}

	getArticleFeed() {
		getFeed(this.props.dispatch, 'article', this.state.cursor, 10);
	}

	render() {
		return (
			<React.Fragment>
				<div className="list-view-header content-header">
					<h1>Articles</h1>
				</div>

				<div className="list content" ref={this.contentsEl}>
					{this.state.newArticlesAvailable && (
						<div
							className="toast"
							onClick={() => {
								this.getArticleFeed();
								this.setState({ newArticlesAvailable: false });
							}}
						>
							New articles available - click to refresh
						</div>
					)}
					{this.props.articles.map((article) => {
						return (
							<ArticleListItem
								key={article._id}
								onNavigation={() => {
									localStorage[
										'all-article-list-scroll-position'
									] = this.contentsEl.current.scrollTop;
								}}
								{...article}
							/>
						);
					})}
					{this.state.reachedEndOfFeed ? (
						<div className="end">
							<p>That&#39;s it! No more articles here.</p>
							<p>
								What, did you think that once you got all the way around,
								you&#39;d just be back at the same place that you started?
								Sounds like some real round-feed thinking to me.
							</p>
						</div>
					) : (
						<div>
							<Waypoint
								onEnter={() =>
									this.setState({ cursor: this.state.cursor + 1 }, () =>
										this.getArticleFeed(),
									)
								}
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
	userID: PropTypes.string.isRequired,
	userArticleStreamToken: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => {
	let articles = [];

	if (state.articles && state.feeds && state.feeds.article)
		articles = state.feeds.article.map((id) => state.articles[id]);

	for (let article of articles) {
		if (state.pinnedArticles && state.pinnedArticles[article._id]) {
			article.pinID = state.pinnedArticles[article._id]._id;
		} else article.pinID = '';

		if (
			state.feeds.article.indexOf(article._id) < 20 &&
			state.feeds.article.indexOf(article._id) !== -1
		) {
			article.recent = true;
		} else {
			article.recent = false;
		}
	}

	return {
		articles,
		userArticleStreamToken: state.user.streamTokens.user_article,
		userID: state.user._id,
	};
};

export default connect(mapStateToProps)(AllArticles);
