import getPlaceholderImageURL from '../../util/getPlaceholderImageURL';
import Img from 'react-image';
import React from 'react';
import Panel from '../Panel';
import fetch from '../../util/fetch';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

class PodcastList extends React.Component {
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
			<Panel>
				<Panel.Header>Podcasts</Panel.Header>
				<Panel.Contents>
					{this.props.podcasts.map(podcast => {
						return (
							<Link key={podcast._id} to={`/podcasts/${podcast._id}`}>
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
				</Panel.Contents>
			</Panel>
		);
	}
}

const mapStateToProps = (state, ownProps) => {
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
		...ownProps,
		podcasts,
	};
};

export default connect(mapStateToProps)(PodcastList);
