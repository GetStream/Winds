import Loader from './Loader';
import PropTypes from 'prop-types';
import React from 'react';
import ReactHtmlParser from 'react-html-parser';
import { connect } from 'react-redux';
import fetch from '../util/fetch';
import TimeAgo from './TimeAgo';

class RSSArticle extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			error: false,
			loadingContent: true,
		};
	}
	componentDidMount() {
		this.props.getArticle(this.props.match.params.articleID);
		if (this.props.url) {
			this.getRSSContent(this.props._id);
		}
	}
	componentWillReceiveProps(nextProps) {
		if (nextProps._id !== this.props._id) {
			this.getRSSContent(nextProps._id);
		}
	}
	getRSSContent(articleId) {
		this.setState({
			loadingContent: true,
		});

		fetch('GET', `/articles/${articleId}`, {}, { type: 'parsed' })
			.then(res => {
				this.setState({
					loadingContent: false,
					...res.data,
				});
			})
			.catch(() => {
				this.setState({
					error: true,
					errorMessage: 'There was a problem loading this article. :(',
					loadingContent: false,
				});
			});
	}
	render() {
		let articleContents;
		if (this.props.loading || this.state.loadingContent) {
			articleContents = <Loader />;
		} else if (this.state.error) {
			articleContents = (
				<div>
					<p>There was a problem loading this article :(</p>
					<p>To read the article, head on over to:</p>
					<p>
						<a href={this.props.url} target="_blank">
							{this.props.title}
						</a>
					</p>
				</div>
			);
		} else {
			articleContents = (
				<div className="rss-article-content">
					{ReactHtmlParser(this.state.content)}
				</div>
			);
		}
		return (
			<div className="rss-article-container">
				<h1>{this.props.title}</h1>
				<div className="info">
					<i className="fa fa-bookmark" />
					<div>
						<i className="fas fa-external-link-alt" />
						<a href={this.props.url}>{this.props.rss.title}</a>
					</div>
					{this.props.commentUrl ? (
						<div>
							<i className="fas fa-comment-alt" />

							<a href={this.props.commentUrl}>Comments</a>
						</div>
					) : null}
					<span className="muted">
						{'Posted '}
						<TimeAgo timestamp={this.props.publicationDate} />
					</span>
				</div>
				{articleContents}
			</div>
		);
	}
}

RSSArticle.defaultProps = {
	images: {},
};

RSSArticle.propTypes = {
	_id: PropTypes.string,
	commentUrl: PropTypes.string,
	description: PropTypes.string,
	getArticle: PropTypes.func.isRequired,
	images: PropTypes.shape({
		og: PropTypes.string,
	}),
	loading: PropTypes.bool,
	match: PropTypes.shape({
		params: PropTypes.shape({
			articleID: PropTypes.string.isRequired,
			rssFeedID: PropTypes.string.isRequired,
		}),
	}),
	publicationDate: PropTypes.string,
	rss: PropTypes.shape({
		title: PropTypes.string,
	}),
	title: PropTypes.string,
	url: PropTypes.string,
};

const mapStateToProps = (state, ownProps) => {
	let articleID = ownProps.match.params.articleID;
	let article = {};
	let rss = {};
	let loading = false;
	if (!('articles' in state) || !(articleID in state.articles)) {
		loading = true;
	} else {
		article = {
			...state.articles[articleID],
		};
		rss = { ...state.rssFeeds[article.rss] };
	}
	// get article's rss feed
	return {
		loading,
		...article,
		rss,
	};
};

const mapDispatchToProps = dispatch => {
	return {
		getArticle: articleID => {
			fetch('GET', `/articles/${articleID}`)
				.then(res => {
					dispatch({
						rssArticle: res.data,
						type: 'UPDATE_ARTICLE',
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
		getArticle: articleID => {
			dispatchProps.getArticle(articleID);
		},
		...ownProps,
		...dispatchProps,
		...stateProps,
	};
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(RSSArticle);
