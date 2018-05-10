import Loader from './Loader';
import PropTypes from 'prop-types';
import React from 'react';
import ReactHtmlParser from 'react-html-parser';
import { connect } from 'react-redux';
import fetch from '../util/fetch';

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
		if (this.state.error) {
			return (
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
		}
		if (this.props.loading) {
			return <Loader />;
		}
		if (this.state.loadingContent) {
			return <Loader />;
		}
		return (
			<div className="rss-article-container">
				<h1>{this.props.title}</h1>
				{this.state.error ? <div>{this.state.errorMessage}</div> : null}
				<div className="rss-article-content">
					{ReactHtmlParser(this.state.content)}
				</div>
			</div>
		);
	}
}

RSSArticle.defaultProps = {
	images: {},
};

RSSArticle.propTypes = {
	_id: PropTypes.string,
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
	title: PropTypes.string,
	url: PropTypes.string,
};

const mapStateToProps = (state, ownProps) => {
	let articleID = ownProps.match.params.articleID;
	let article = {};
	let loading = false;
	if (!('articles' in state) || !(articleID in state.articles)) {
		loading = true;
	} else {
		article = {
			...state.articles[articleID],
		};
	}
	return {
		loading,
		...article,
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
