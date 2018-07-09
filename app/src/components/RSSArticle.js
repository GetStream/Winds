import { pinArticle, unpinArticle, getPinnedArticles } from '../util/pins';
import Loader from './Loader';
import PropTypes from 'prop-types';
import React from 'react';
import ReactHtmlParser from 'react-html-parser';
import { connect } from 'react-redux';
import fetch from '../util/fetch';
import TimeAgo from './TimeAgo';
import ReactPlayer from 'react-player';
import isElectron from 'is-electron';

class RSSArticle extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			error: false,
			loadingContent: true,
		};
	}

	componentDidMount() {
		getPinnedArticles(this.props.dispatch);
		this.getArticle(this.props.match.params.articleID);
		if (this.props.url) {
			this.getRSSContent(this.props._id);
		}
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps._id !== this.props._id) {
			getPinnedArticles(this.props.dispatch);
			this.getArticle(nextProps.match.params.articleID);
			this.getRSSContent(nextProps._id);
		}
	}

	tweet() {
		const getWindowOptions = function() {
			const width = 500;
			const height = 350;
			const left = window.innerWidth / 2 - width / 2;
			const top = window.innerHeight / 2 - height / 2;

			return [
				'resizable,scrollbars,status',
				'height=' + height,
				'width=' + width,
				'left=' + left,
				'top=' + top,
			].join();
		};

		const shareUrl = `https://twitter.com/intent/tweet?url=${
			window.location.href
		}&text=${this.props.rss.title} - ${this.props.description}&hashtags=Winds,RSS`;

		const win = window.open(shareUrl, 'Share on Twitter', getWindowOptions());
		win.opener = null;
	}

	reddit() {
		alert('reddit');
	}

	hn() {
		alert('hn');
	}

	getArticle(articleID) {
		fetch('GET', `/articles/${articleID}`)
			.then(res => {
				this.props.dispatch({
					rssArticle: res.data,
					type: 'UPDATE_ARTICLE',
				});
			})
			.catch(err => {
				console.log(err); // eslint-disable-line no-console
			});
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
			<React.Fragment>
				<div className="content-header">
					<h1>{this.props.title}</h1>
					<div className="item-info">
						<span
							className="bookmark"
							onClick={e => {
								e.preventDefault();
								e.stopPropagation();
								if (this.props.pinned) {
									unpinArticle(
										this.props.pinID,
										this.props._id,
										this.props.dispatch,
									);
								} else {
									pinArticle(this.props._id, this.props.dispatch);
								}
							}}
						>
							{this.props.pinned ? (
								<i className="fa fa-bookmark" />
							) : (
								<i className="far fa-bookmark" />
							)}
						</span>{' '}
						{!isElectron() ? (
							<span>
								<a
									href="tweet"
									onClick={e => {
										e.preventDefault();
										e.stopPropagation();

										this.tweet();
									}}
								>
									<i className="fab fa-twitter" />
								</a>
							</span>
						) : null}
						{!isElectron() ? (
							<span>
								<a href={`https://reddit.com/r/programming`} target="_blank">
									<i className="fab fa-reddit-alien" />
								</a>
							</span>
						) : null}
						{!isElectron() ? (
							<span>
								<a href={this.props.rss.url} target="_blank">
									<i className="fab fa-hacker-news-square" />
								</a>
							</span>
						) : null}
						<div>
							<a href={this.props.url}>{this.props.rss.title}</a>
						</div>
						{this.props.commentUrl ? (
							<div>
								<i className="fas fa-comment" />
								<a href={this.props.commentUrl}>Comments</a>
							</div>
						) : null}
						<span className="muted">
							{'Posted '}
							<TimeAgo timestamp={this.props.publicationDate} />
						</span>
					</div>
				</div>

				<div className="content">
					<div className="enclosures">
						{this.props.enclosures.map(
							enclosure =>
								enclosure.type.includes('audio') ||
								enclosure.type.includes('video') ||
								enclosure.type.includes('youtube') ? (
									<ReactPlayer
										controls={true}
										key={enclosure._id}
										url={enclosure.url}
									/>
								) : null,
						)}
					</div>
					{articleContents}
				</div>
			</React.Fragment>
		);
	}
}

RSSArticle.defaultProps = {
	images: {},
};

RSSArticle.propTypes = {
	_id: PropTypes.string,
	commentUrl: PropTypes.string,
	enclosures: PropTypes.arrayOf(
		PropTypes.shape({
			_id: PropTypes.string,
			url: PropTypes.string,
			type: PropTypes.string,
			length: PropTypes.string,
		}),
	),
	description: PropTypes.string,
	dispatch: PropTypes.func.isRequired,
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
	pinID: PropTypes.string,
	pinned: PropTypes.bool,
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
	if (!article.enclosures) {
		article.enclosures = [];
	}
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

	if (state.pinnedArticles && state.pinnedArticles[article._id]) {
		article.pinned = true;
		article.pinID = state.pinnedArticles[article._id]._id;
	} else {
		article.pinned = false;
	}

	// get article's rss feed
	return {
		loading,
		...article,
		rss,
	};
};

export default connect(mapStateToProps)(RSSArticle);
