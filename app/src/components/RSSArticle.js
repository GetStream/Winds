import url from 'url';
import React from 'react';
import PropTypes from 'prop-types';
import ReactPlayer from 'react-player';
import ReactHtmlParser from 'react-html-parser';
import isElectron from 'is-electron';
import { connect } from 'react-redux';

import fetch from '../util/fetch';
import { pinArticle, unpinArticle, getPinnedArticles } from '../util/pins';
import { fetchSocialScore } from '../util/social';

import Loader from './Loader';
import TimeAgo from './TimeAgo';

function mergeSocialScore(article, socialScore) {
	article.socialScore = article.socialScore || {};
	for (const key of Object.keys(socialScore)) {
		article.socialScore[key] = Object.assign({ score: article.socialScore[key] }, socialScore[key]);
	}
	return article;
}

class RSSArticle extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			error: false,
			loadingContent: true,
			sentArticleReadCompleteAnalyticsEvent: false,
		};

		this.contentRef = React.createRef();
	}

	componentDidMount() {
		window.streamAnalyticsClient.trackEngagement({
			label: 'article_open',
			content: {
				foreign_id: `articles:${this.props.match.params.articleID}`,
			},
		});

		getPinnedArticles(this.props.dispatch);

		this.getArticle(this.props.match.params.articleID);
		this.getRSSContent(this.props.match.params.articleID);
		this.contentRef.current.onscroll = e => {
			let scrollPercentage =
				this.contentRef.current.scrollTop /
				(this.contentRef.current.scrollHeight -
					this.contentRef.current.clientHeight);
			if (
				!this.state.sentArticleReadCompleteAnalyticsEvent &&
				scrollPercentage > 0.8
			) {
				window.streamAnalyticsClient.trackEngagement({
					label: 'article_read_complete',
					content: {
						foreign_id: `articles:${this.props.match.params.articleID}`,
					},
				});

				this.setState({
					sentArticleReadCompleteAnalyticsEvent: true,
				});
			}
		};
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.match.params.articleID !== this.props.match.params.articleID) {
			this.setState({
				sentArticleReadCompleteAnalyticsEvent: false,
			});

			window.streamAnalyticsClient.trackEngagement({
				label: 'article_open',
				content: {
					foreign_id: `articles:${nextProps.match.params.articleID}`,
				},
			});

			getPinnedArticles(this.props.dispatch);

			this.getArticle(nextProps.match.params.articleID);
			this.getRSSContent(nextProps.match.params.articleID);
		}
	}

	tweet() {
		const location = url.parse(window.location.href);
		const link = {
			protocol: 'https',
			hostname: 'winds.getstream.io',
			pathname: location.pathname,
		};
		if (location.pathname === '/' && location.hash) {
			link.pathname = location.hash.slice(1);
		}
		const shareUrl = `https://twitter.com/intent/tweet?url=${url.format(link)}&text=${this.props.title}&hashtags=Winds,RSS`;

		if (isElectron()) {
			window.ipcRenderer.send('open-external-window', shareUrl);
		} else {
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

			const win = window.open(shareUrl, 'Share on Twitter', getWindowOptions());
			win.opener = null;
		}
	}

	async getArticle(articleID) {
		try {
			const res = await fetch('GET', `/articles/${articleID}`);
			this.props.dispatch({
				rssArticle: res.data,
				type: 'UPDATE_ARTICLE',
			});
			const [reddit, hackernews] = await Promise.all([
				fetchSocialScore('reddit', res.data),
				fetchSocialScore('hackernews', res.data),
			]);
			this.props.dispatch({
				rssArticle: mergeSocialScore(res.data, { reddit, hackernews }),
				type: 'UPDATE_ARTICLE',
			});
		} catch(err) {
			if (window.console) {
				console.log(err); // eslint-disable-line no-console
			}
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

		const redditDataAvailable = this.props.socialScore &&
			this.props.socialScore.reddit &&
			this.props.socialScore.reddit.url;
		const hackernewsDataAvailable = this.props.socialScore &&
			this.props.socialScore.hackernews &&
			this.props.socialScore.hackernews.url;

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
									unpinArticle(this.props.pinID, this.props._id, this.props.dispatch);
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
						{redditDataAvailable ? (
							<span>
								{this.props.socialScore.reddit.score}
								{isElectron() ? (
									<a href={this.props.socialScore.reddit.url} target="_blank">
										<i className="fab fa-reddit-alien" />
									</a>
								) : (
									<a
										href="tweet"
										onClick={e => {
											e.preventDefault();
											e.stopPropagation();

											window.ipcRenderer.send('open-external-window', this.props.socialScore.reddit.url);
										}}
									>
										<i className="fab fa-reddit-alien" />
									</a>
								)}
							</span>
						) : null}
						{hackernewsDataAvailable ? (
							<span>
								{this.props.socialScore.hackernews.score}
								{isElectron() ? (
									<a href={this.props.socialScore.hackernews.url} target="_blank">
										<i className="fab fa-hacker-news-square" />
									</a>
								) : (
									<a
										href="tweet"
										onClick={e => {
											e.preventDefault();
											e.stopPropagation();

											window.ipcRenderer.send('open-external-window', this.props.socialScore.hackernews.url);
										}}
									>
										<i className="fab fa-hacker-news-square" />
									</a>
								)}
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

				<div className="content" ref={this.contentRef}>
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
	duplicateOf: PropTypes.string,
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
	socialScore: PropTypes.shape({
		reddit: PropTypes.shape({
			url: PropTypes.string,
			score: PropTypes.number,
		}),
		hackernews: PropTypes.shape({
			url: PropTypes.string,
			score: PropTypes.number,
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
		article = { ...state.articles[articleID] };
		rss = { ...state.rssFeeds[article.rss] };
	}

	if (state.pinnedArticles && state.pinnedArticles[article._id]) {
		article.pinned = true;
		article.pinID = state.pinnedArticles[article._id]._id;
	} else {
		article.pinned = false;
	}

	return {
		loading,
		...article,
		rss,
	};
};

export default connect(mapStateToProps)(RSSArticle);
