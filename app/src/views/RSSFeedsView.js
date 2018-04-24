import { Route, Switch } from 'react-router-dom';
import Img from 'react-image';
import ListOfFollowedRSSFeeds from '../components/ListOfFollowedRSSFeeds';
import RSSArticle from '../components/RSSArticle';
import RSSArticleList from '../components/RSSArticleList';
import RSSPanelsContainer from '../components/RSSPanelsContainer';
import React from 'react';
import AddRSSModal from '../components/AddRSSModal';
import { connect } from 'react-redux';
import fetch from '../util/fetch';
import PropTypes from 'prop-types';
import FollowerList from '../components/FollowerList';
import addButton from '../images/icons/add.svg';
import partialIcon from '../images/icons/partial.svg';

const RSSNotSelected = () => {
	return (
		<div className="none-selected">
			<Img src={partialIcon} />
			<div>Select an RSS Feed</div>
		</div>
	);
};

class RSSFeedsView extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			newRSSModalIsOpen: false,
			selectedTab: localStorage['selectedRSSTab'] || 'all',
		};
		this.toggleNewRSSModal = this.toggleNewRSSModal.bind(this);
	}
	componentDidMount() {
		if (this.props.match.params.rssFeedID) {
			fetch('get', `/rss/${this.props.match.params.rssFeedID}`).then(response => {
				this.props.dispatch({
					rssFeed: response.data,
					type: 'UPDATE_RSS_FEED',
				});
			});
		}
	}
	componentWillReceiveProps(nextProps) {
		if (this.props.match.params.rssFeedID !== nextProps.match.params.rssFeedID) {
			fetch('get', `/rss/${nextProps.match.params.rssFeedID}`).then(response => {
				this.props.dispatch({
					rssFeed: response.data,
					type: 'UPDATE_RSS_FEED',
				});
			});
		}
	}
	toggleNewRSSModal() {
		this.setState({
			newRSSModalIsOpen: !this.state.newRSSModalIsOpen,
		});
	}

	render() {
		let columnComponents = null;
		if (this.state.selectedTab === 'all') {
			columnComponents = <RSSPanelsContainer />;
		} else if (this.state.selectedTab === 'my-rss-feeds') {
			columnComponents = <ListOfFollowedRSSFeeds />;
		}

		let leftColumn;
		if (this.props.rssFeed && this.props.rssFeed.featured) {
			leftColumn = (
				<div className="column">
					<div className="column-header" />
					<div className="column-content featured-rss">
						<div
							className="hero-card"
							style={{
								backgroundImage: `linear-gradient(to top, black, transparent), url(${
									this.props.rssFeed.images.featured
								})`,
							}}
						>
							<h1>{this.props.rssFeed.title}</h1>
							<div className="info">rss</div>
						</div>
						<label>About {this.props.rssFeed.title}</label>
						<h1>{this.props.rssFeed.description}</h1>
						<div>{this.props.rssFeed.summary}</div>
						<FollowerList id={this.props.rssFeed._id} type="rss" />
					</div>
				</div>
			);
		} else {
			leftColumn = (
				<div className="column">
					<div className="column-header">
						<div className="heading-with-button">
							<h1>RSS</h1>
							<Img
								className="plus-button"
								onClick={this.toggleNewRSSModal}
								src={addButton}
							/>
						</div>

						<ul className="tabs">
							<li
								className={`tab ${
									this.state.selectedTab === 'all' ? 'active' : ''
								}`}
								onClick={() => {
									localStorage['selectedRSSTab'] = 'all';
									this.setState({
										selectedTab: 'all',
									});
								}}
							>
								All
							</li>
							<li
								className={`tab ${
									this.state.selectedTab === 'my-rss-feeds'
										? 'active'
										: ''
								}`}
								onClick={() => {
									localStorage['selectedRSSTab'] = 'my-rss-feeds';
									this.setState({
										selectedTab: 'my-rss-feeds',
									});
								}}
							>
								My RSS Feeds
							</li>
						</ul>
					</div>
					<div className="column-content">{columnComponents}</div>
					<AddRSSModal
						done={this.toggleNewRSSModal}
						isOpen={this.state.newRSSModalIsOpen}
						toggleModal={this.toggleNewRSSModal}
					/>
				</div>
			);
		}

		return (
			<div className="two-columns rss-view">
				{leftColumn}
				<div className="column">
					<Switch>
						<Route
							component={RSSArticle}
							path="/rss/:rssFeedID/articles/:articleID"
						/>
						<Route component={RSSArticleList} path="/rss/:rssFeedID" />
						<Route component={RSSNotSelected} />
					</Switch>
				</div>
			</div>
		);
	}
}

RSSFeedsView.propTypes = {
	dispatch: PropTypes.func.isRequired,
	match: PropTypes.shape({
		params: PropTypes.shape({
			rssFeedID: PropTypes.string,
		}).isRequired,
	}).isRequired,
	rssFeed: PropTypes.shape({
		_id: PropTypes.string.isRequired,
		description: PropTypes.string,
		featured: PropTypes.boolean,
		images: PropTypes.shape({
			featured: PropTypes.string,
		}),
		summary: PropTypes.string,
		title: PropTypes.string,
	}),
};

const mapStateToProps = (state, ownProps) => {
	if (ownProps.match.params.rssFeedID && state.rssFeeds) {
		return {
			...ownProps,
			rssFeed: state.rssFeeds[ownProps.match.params.rssFeedID],
		};
	} else {
		return { ...ownProps };
	}
};

const mapDispatchToProps = (dispatch, ownProps) => {
	return { ...ownProps, dispatch };
};

export default connect(mapStateToProps, mapDispatchToProps)(RSSFeedsView);
