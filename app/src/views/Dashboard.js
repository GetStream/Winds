import FeaturedItems from '../components/FeaturedItems';
import { Link } from 'react-router-dom';
import Loader from '../components/Loader';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import RecentEpisodesPanel from '../components/PodcastPanels/RecentEpisodesPanel';
import RecentArticlesPanel from '../components/RSSPanels/RecentArticlesPanel';
import PodcastList from '../components/PodcastPanels/PodcastList';
import RssFeedList from '../components/RSSPanels/RssFeedList';
import DiscoverSection from '../components/DiscoverSection';
import fetch from '../util/fetch';

class Dashboard extends React.Component {
	constructor(props) {
		super(props);

		this.refresh = this.refresh.bind(this);
	}

	refresh() {
		fetch('GET', '/podcasts', {}, { type: 'recommended' })
			.then(res => {
				this.props.dispatch({
					podcasts: res.data,
					type: 'BATCH_UPDATE_PODCASTS',
				});

				this.props.dispatch({
					podcasts: res.data,
					type: 'UPDATE_SUGGESTED_PODCASTS',
				});
			})
			.catch(err => {
				if (window.console) {
					console.log(err); // eslint-disable-line no-console
				}
			});
		fetch('GET', '/rss', {}, { type: 'recommended' })
			.then(res => {
				this.props.dispatch({
					rssFeeds: res.data,
					type: 'BATCH_UPDATE_RSS_FEEDS',
				});

				this.props.dispatch({
					rssFeeds: res.data,
					type: 'UPDATE_SUGGESTED_RSS_FEEDS',
				});
			})
			.catch(err => {
				if (window.console) {
					console.log(err); // eslint-disable-line no-console
				}
			});
	}

	render() {
		if (this.props.loading) {
			return <Loader />;
		}

		return (
			<div className="dashboard">
				<FeaturedItems />
				<Link className="column-header podcast-header" to="/podcasts">
					<h1>Podcasts</h1>
					<div className="drilldown">
						<div>View all</div>
						<i className="fa fa-chevron-right" />
					</div>
				</Link>
				<div className="podcasts-section">
					<div className="column-content">
						<RecentEpisodesPanel />
						<PodcastList />
					</div>
				</div>
				<Link className="column-header rss-header" to="/rss">
					<h1>RSS</h1>
					<div className="drilldown">
						<div>View all</div>
						<i className="fa fa-chevron-right" />
					</div>
				</Link>
				<div className="rss-section">
					<div className="column-content">
						<RecentArticlesPanel />
						<RssFeedList />
					</div>
				</div>
				<div className="column-header discover-header" onClick={this.refresh}>
					<h1>Discover</h1>
					<div className="drilldown">
						<div>Refresh</div>
						<i className="fas fa-sync" />
					</div>
				</div>
				<div className="discover-section ">
					<div className="column-content">
						<DiscoverSection />
					</div>
				</div>
				<div className="border1" />
				<div className="border2" />
			</div>
		);
	}
}

Dashboard.defaultProps = {
	loading: true,
	showIntroBanner: true,
};

Dashboard.propTypes = {
	loading: PropTypes.bool,
	showIntroBanner: PropTypes.bool,
	userEmail: PropTypes.string,
	userID: PropTypes.string,
	userName: PropTypes.string,
};

const mapStateToProps = state => {
	let user = state.users[localStorage['authedUser']];

	if (!user) {
		return { loading: true };
	}

	let showIntroBanner = false;
	if (state['showIntroBanner'] === true) {
		showIntroBanner = true;
	}
	return {
		loading: false,
		showIntroBanner,
		userEmail: user.email,
		userID: user._id,
		userName: user.name,
	};
};

export default connect(mapStateToProps)(Dashboard);
