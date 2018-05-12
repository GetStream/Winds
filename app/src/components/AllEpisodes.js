import fetch from '../util/fetch';
import getPlaceholderImageURL from '../util/getPlaceholderImageURL';
// import Popover from 'react-popover';
// import optionsIcon from '../images/icons/options.svg';
import Img from 'react-image';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import TimeAgo from './TimeAgo';
import { Link } from 'react-router-dom';

class AllEpisodes extends React.Component {
	componentDidMount() {
		fetch('GET', `/users/${localStorage['authedUser']}/feeds`, null, {
			type: 'episode',
		}).then(response => {
			let episodes = response.data.map(episode => {
				return { ...episode, type: 'episode' };
			});

			for (let episode of episodes) {
				if (episode._id) {
					// update podcast
					this.props.dispatch({
						podcast: episode.podcast,
						type: 'UPDATE_PODCAST_SHOW',
					});
					// update episode
					this.props.dispatch({
						episode,
						type: 'UPDATE_EPISODE',
					});
				} else {
					return;
				}
			}

			this.props.dispatch({
				activities: episodes,
				feedID: `user_episode:${localStorage['authedUser']}`,
				type: 'UPDATE_FEED',
			});
		});
	}
	render() {
		return (
			<div>
				<div className="podcast-header">
					<h1>All Episodes</h1>
				</div>
				<div className="list">
					{this.props.episodes.map(episode => {
						return (
							<Link
								className="list-item podcast-episode"
								key={episode._id}
								to={`/podcasts/${episode.podcast._id}`}
							>
								<div className="left">
									<Img
										height="100"
										src={[
											episode.images.og,
											getPlaceholderImageURL(episode.podcast._id),
										]}
										width="100"
									/>
								</div>
								<div className="right">
									<h2>{episode.title}</h2>
									<div className="info">
										<span
											onClick={e => {
												e.preventDefault();
												e.stopPropagation();
												if (this.props.pinned) {
													this.props.unpinEpisode();
												} else {
													this.props.pinEpisode();
												}
											}}
										>
											{episode.pinned ? (
												<i className="fa fa-bookmark" />
											) : (
												<i className="far fa-bookmark" />
											)}
										</span>
										<span className="date">
											{'Posted '}
											<TimeAgo
												timestamp={episode.publicationDate}
											/>
										</span>
									</div>
									<div className="description">
										{this.props.description}
									</div>
								</div>
							</Link>
						);
					})}
				</div>
			</div>
		);
	}
}
//
// <EpisodeListItem
// 	active={active}
// 	key={episode._id}
// 	pinEpisode={() => {
// 		this.props.pinEpisode(episode._id);
// 	}}
// 	playOrPauseEpisode={() => {
// 		if (active && this.props.context.playing) {
// 			this.props.pauseEpisode();
// 		} else if (active) {
// 			this.props.resumeEpisode();
// 		} else {
// 			this.props.playEpisode(episode._id, i);
// 		}
// 	}}
// 	playing={this.props.context.playing}
// 	position={i}
// 	unpinEpisode={() => {
// 		this.props.unpinEpisode(episode.pinID, episode._id);
// 	}}
// 	{...episode}
// />;

AllEpisodes.defaultProps = {
	episodes: [],
};
AllEpisodes.propTypes = {
	dispatch: PropTypes.func.isRequired,
	episodes: PropTypes.arrayOf(PropTypes.shape({})),
	pinned: PropTypes.bool,
};

const mapStateToProps = (state, ownProps) => {
	let episodes = [];
	if (state.feeds && state.feeds[`user_episode:${localStorage['authedUser']}`]) {
		for (let episodeID of state.feeds[`user_episode:${localStorage['authedUser']}`]) {
			// also get RSS feed
			let episode = {
				...state.episodes[episodeID.split(':')[1]],
			};
			episode.podcast = state.podcasts[episode.podcast];

			episodes.push(episode);
		}
	}

	return { ...ownProps, episodes };
};

export default connect(mapStateToProps)(AllEpisodes);
