import getPlaceholderImageURL from '../../util/getPlaceholderImageURL';
import Img from 'react-image';
import React from 'react';
import Panel from '../Panel';
import fetch from '../../util/fetch';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

class PodcastList extends React.Component {
	componentDidMount() {
		fetch('GET', '/follows', null, { type: 'podcast' })
			.then(res => {
				this.props.dispatch({
					type: 'UPDATE_USER',
					user: res.data[0].user,
				});

				let podcasts = [];
				let podcastFollowRelationships = [];

				for (let followRelationship of res.data) {
					podcasts.push(followRelationship.podcast);
					podcastFollowRelationships.push({
						podcastID: followRelationship.podcast._id,
						userID: followRelationship.user._id,
					});
				}

				this.props.dispatch({
					podcasts,
					type: 'BATCH_UPDATE_PODCASTS',
				});

				this.props.dispatch({
					podcastFollowRelationships,
					type: 'BATCH_FOLLOW_PODCASTS',
				});
			})
			.catch(err => {
				if (window.console) {
					console.log(err); // eslint-disable-line no-console
				}
			});
	}

	render() {
		return (
			<Panel
				hasHighlight={
					this.props.match.params.podcastID &&
					this.props.match.params.podcastID !== 'recent'
				}
				headerText="Podcasts"
			>
				{this.props.podcasts.map(podcast => {
					return (
						<Link
							className={
								this.props.match.params.podcastID === podcast._id
									? 'highlighted'
									: ''
							}
							key={podcast._id}
							to={`/podcasts/${podcast._id}`}
						>
							<Img
								src={[
									podcast.images.favicon,
									getPlaceholderImageURL(podcast._id),
								]}
							/>
							<div>{podcast.title}</div>
							<div>
								<i className="fa fa-chevron-right" />
							</div>
						</Link>
					);
				})}
			</Panel>
		);
	}
}

PodcastList.propTypes = {
	dispatch: PropTypes.func.isRequired,
	match: PropTypes.shape({
		params: PropTypes.shape({
			podcastID: PropTypes.string,
		}),
	}),
	podcasts: PropTypes.arrayOf(PropTypes.shape({})),
};

const mapStateToProps = (state, ownProps) => {
	let podcastsUserFollows = [];

	if (state.followedPodcasts && state.followedPodcasts[localStorage['authedUser']]) {
		for (let podcastID of Object.keys(
			state.followedPodcasts[localStorage['authedUser']],
		)) {
			if (state.followedPodcasts[localStorage['authedUser']][podcastID]) {
				podcastsUserFollows.push(podcastID);
			}
		}
	}

	let podcasts = podcastsUserFollows.map(podcastID => {
		return state.podcasts[podcastID];
	});

	if (state.aliases) {
		podcasts = podcasts.map(podcast => {
			if (state.aliases[podcast._id])
				podcast.title = state.aliases[podcast._id].alias;
			return podcast;
		});
	}

	podcasts.sort((a, b) => {
		return a.title.localeCompare(b.title);
	});
	return {
		...ownProps,
		podcasts,
	};
};

export default connect(mapStateToProps)(withRouter(PodcastList));
