import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import fetch from '../util/fetch';
import getPlaceholderImageURL from '../util/getPlaceholderImageURL';
import { Link } from 'react-router-dom';

class ShowsGrid extends React.Component {
	componentDidMount() {
		// fetch list of shows the user is following
		fetch('get', '/follows', null, { user: localStorage['authedUser'] }).then(
			response => {
				// there's no way to request only podcast follows, so we gotta filter them out
				let podcastFollowRelationships = response.data.filter(
					followRelationship => {
						if (
							'podcast' in followRelationship &&
							followRelationship['podcast'] !== null
						) {
							return true;
						} else {
							return false;
						}
					},
				);
				if (podcastFollowRelationships.length !== 0) {
					// dispatch user (once)
					this.props.dispatch({
						type: 'UDPATE_USER',
						user: podcastFollowRelationships[0].user,
					});
				}
				// for each show:

				for (let podcastFollowRelationship of podcastFollowRelationships) {
					// dispatch show
					this.props.dispatch({
						podcast: podcastFollowRelationship.podcast,
						type: 'UPDATE_PODCAST_SHOW',
					});
					// dispatch following relationships
					this.props.dispatch({
						podcastID: podcastFollowRelationship.podcast._id,
						type: 'FOLLOW_PODCAST',
						userID: podcastFollowRelationship.user._id,
					});
				}
			},
		);
	}
	render() {
		return (
			<div className="shows-grid">
				{this.props.podcasts.map(podcast => {
					return (
						<Link
							className="shows-grid-item"
							key={podcast._id}
							to={`/podcasts/${podcast._id}`}
						>
							<div
								className="shows-grid-item-image"
								style={{
									backgroundImage: `url(${podcast.images.featured ||
										podcast.images.favicon ||
										getPlaceholderImageURL(podcast._id)})`,
								}}
							/>
							<h3>{podcast.title}</h3>
						</Link>
					);
				})}
			</div>
		);
	}
}

ShowsGrid.propTypes = {
	dispatch: PropTypes.func.isRequired,
	podcasts: PropTypes.arrayOf(PropTypes.shape({})),
};

const mapStateToProps = (state, ownProps) => {
	// get list of following shows
	let podcasts = [];
	if (state.followedPodcasts) {
		for (var podcastID in state.followedPodcasts[localStorage['authedUser']]) {
			if (
				state.followedPodcasts[localStorage['authedUser']].hasOwnProperty(
					podcastID,
				)
			) {
				if (
					state.followedPodcasts[localStorage['authedUser']][podcastID] === true
				) {
					podcasts.push(state.podcasts[podcastID]);
				}
			}
		}
	}

	return { ...ownProps, podcasts };
};

const mapDispatchToProps = (dispatch, ownProps) => {
	return { ...ownProps, dispatch };
};

export default connect(mapStateToProps, mapDispatchToProps)(ShowsGrid);
