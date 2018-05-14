import forwardBlackIcon from '../images/icons/forward-black.svg';
import FeaturedItems from '../components/FeaturedItems';
import Img from 'react-image';
import { Link } from 'react-router-dom';
import Loader from '../components/Loader';
// import NewShareForm from '../components/NewShareForm';
import PropTypes from 'prop-types';
// import RSSPanelsContainer from '../components/RSSPanelsContainer';
import React from 'react';
import { connect } from 'react-redux';
import RecentEpisodesPanel from '../components/PodcastPanels/RecentEpisodesPanel';
import RecentArticlesPanel from '../components/RSSPanels/RecentArticlesPanel';
import PodcastList from '../components/PodcastPanels/PodcastList';
import RssFeedList from '../components/RSSPanels/RssFeedList';
import DiscoverSection from '../components/DiscoverSection';

class Dashboard extends React.Component {
	render() {
		if (this.props.loading) {
			return <Loader />;
		}
		return (
			<div className="dashboard">
				<FeaturedItems />
				<div className="three-columns">
					<div className="column">
						<Link className="column-header" to="/podcasts">
							<h1>Podcasts</h1>
							<div className="drilldown">
								<div>View all</div>
								<Img src={forwardBlackIcon} />
							</div>
						</Link>
						<div className="column-content">
							<RecentEpisodesPanel />
							<PodcastList />
						</div>
					</div>
					<div className="column">
						<Link className="column-header" to="/rss">
							<h1>Read</h1>
							<div className="drilldown">
								<div>View all</div>
								<Img src={forwardBlackIcon} />
							</div>
						</Link>
						<div className="column-content">
							<RecentArticlesPanel />
							<RssFeedList />
						</div>
					</div>
					<div className="column">
						<div className="column-header">
							<h1>Discover</h1>
						</div>
						<div className="column-content">
							<DiscoverSection />
						</div>
					</div>
				</div>
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
