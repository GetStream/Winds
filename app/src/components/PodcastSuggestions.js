import PodcastSuggestion from '../components/PodcastSuggestion';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import fetch from '../util/fetch';

class PodcastSuggestions extends React.Component {
	componentDidMount() {
		this.props.getPodcasts();
	}
	render() {
		return (
			<div className="podcast-suggestions">
				{this.props.suggestedPodcasts.map((suggestedPodcast, i) => {
					return (
						<PodcastSuggestion
							image={suggestedPodcast.images.favicon}
							key={i}
							podcastID={suggestedPodcast._id}
							title={suggestedPodcast.title}
						/>
					);
				})}
			</div>
		);
	}
}

PodcastSuggestions.propTypes = {
	getPodcasts: PropTypes.func.isRequired,
	suggestedPodcasts: PropTypes.array,
};

const mapStateToProps = (state, ownProps) => {
	let suggestedPodcasts = [];
	let loading = false;
	if ('suggestedPodcasts' in state) {
		for (let podcastID of state.suggestedPodcasts) {
			suggestedPodcasts.push(state.podcasts[podcastID]);
		}
	} else {
		loading = true;
	}
	return {
		...ownProps,
		loading,
		suggestedPodcasts,
	};
};

const mapDispatchToProps = (dispatch, ownProps) => {
	return {
		...ownProps,
		getPodcasts: () => {
			fetch('GET', '/podcasts', {}, { type: 'recommended' })
				.then(res => {
					// loop through podcasts, update each podcast
					for (let podcast of res.data) {
						dispatch({
							podcast,
							type: 'UPDATE_PODCAST_SHOW',
						});
					}

					// set "recommendedPodcasts" value in state
					// map podcasts to IDs, dispatch
					dispatch({
						podcasts: res.data,
						type: 'UPDATE_SUGGESTED_PODCASTS',
					});
				})
				.catch(err => {
					console.log(err); // eslint-disable-line no-console
				});
		},
	};
};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
	return {
		...ownProps,
		...dispatchProps,
		...stateProps,
		getPodcasts: () => {
			dispatchProps.getPodcasts();
		},
	};
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(
	PodcastSuggestions,
);
