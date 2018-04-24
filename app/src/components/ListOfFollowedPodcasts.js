import { Link } from 'react-router-dom';
import Img from 'react-image';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import fetch from '../util/fetch';
import getPlaceholderImageURL from '../util/getPlaceholderImageURL';

class ListOfFollowedPodcasts extends React.Component {
	componentDidMount() {
		// get a list of all followed podcasts, then update podcasts + following relationships
		fetch('GET', '/follows', null, { type: 'podcast' })
			.then(response => {
				for (let followRelationship of response.data) {
					// update podcast
					this.props.dispatch({
						podcast: followRelationship.podcast,
						type: 'UPDATE_PODCAST_SHOW',
					});
					// update user
					this.props.dispatch({
						type: 'UPDATE_USER',
						user: followRelationship.user,
					});
					// set user to follow podcast
					this.props.dispatch({
						podcastID: followRelationship.podcast._id,
						type: 'FOLLOW_PODCAST',
						userID: followRelationship.user._id,
					});
				}
			})
			.catch(err => {
				console.log(err); // eslint-disable-line no-console
			});
	}

	render() {
		return (
			<div className="panel">
				{this.props.podcasts.map(podcast => {
					return (
						<Link
							className="panel-element"
							key={podcast._id}
							to={`/podcasts/${podcast._id}`}
						>
							<div className="left">
								<Img
									src={[
										podcast.images.favicon,
										getPlaceholderImageURL(podcast._id),
									]}
								/>
							</div>
							<div className="center">{podcast.title}</div>
						</Link>
					);
				})}
			</div>
		);
	}
}

ListOfFollowedPodcasts.defaultProps = {
	podcasts: [],
};

ListOfFollowedPodcasts.propTypes = {
	dispatch: PropTypes.func.isRequired,
	podcasts: PropTypes.arrayOf(PropTypes.shape({})),
};

const mapStateToProps = state => {
	let podcastsUserFollows = [];
	// get all the podcast IDs for podcasts that I follow
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

	podcasts.sort((a, b) => {
		return a.title.localeCompare(b.title);
	});
	return {
		podcasts,
	};
};

export default connect(mapStateToProps)(ListOfFollowedPodcasts);
