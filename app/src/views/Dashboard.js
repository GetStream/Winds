import forwardGreenIcon from '../images/icons/forward-green.svg';
import FeaturedItems from '../components/FeaturedItems';
import Img from 'react-image';
import { Link } from 'react-router-dom';
import Loader from '../components/Loader';
import NewShareForm from '../components/NewShareForm';
import PropTypes from 'prop-types';
import RSSPanelsContainer from '../components/RSSPanelsContainer';
import React from 'react';
import TimelineFeed from '../components/TimelineFeed';
import { connect } from 'react-redux';
import fetch from '../util/fetch';
import DashboardListenSection from '../components/DashboardListenSection';

class PresentationalDashboard extends React.Component {
	render() {
		if (this.props.loading) {
			return <Loader />;
		}
		return (
			<div className="dashboard">
				<FeaturedItems />
				<div className="three-columns">
					<div className="column">
						<div className="column-header">
							<h1>Timeline</h1>
						</div>
						<div className="column-content">
							<NewShareForm
								userEmail={this.props.userEmail}
								userID={this.props.userID}
							/>
							<TimelineFeed />
						</div>
					</div>
					<div className="column">
						<Link className="column-header" to="/podcasts">
							<h1>Listen</h1>
							<Img src={forwardGreenIcon} />
						</Link>
						<div className="column-content">
							<DashboardListenSection />
						</div>
					</div>
					<div className="column">
						<Link className="column-header" to="/rss">
							<h1>Read</h1>
							<Img src={forwardGreenIcon} />
						</Link>
						<div className="column-content">
							<RSSPanelsContainer />
						</div>
					</div>
				</div>
			</div>
		);
	}
}

PresentationalDashboard.defaultProps = {
	loading: true,
	showIntroBanner: true,
};

PresentationalDashboard.propTypes = {
	dismissIntroBanner: PropTypes.func.isRequired,
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

const mapDispatchToProps = dispatch => {
	return {
		dismissIntroBanner: () => {
			localStorage['dismissedIntroBanner'] = true;
			dispatch({ type: 'DISMISS_INTRO_BANNER' });
		},
		getUser: () => {
			fetch('GET', `/users/${localStorage['authedUser']}`).then(res => {
				dispatch({
					type: 'UPDATE_USER',
					user: res.data,
				});
			});
		},
	};
};

const Dashboard = connect(mapStateToProps, mapDispatchToProps)(PresentationalDashboard);

export { Dashboard };
