import { Link } from 'react-router-dom';
import getPlaceholderImageURL from '../../util/getPlaceholderImageURL';
import { Img } from 'react-image';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import Panel from '../Panel';
import { getSuggestedPodcasts, followPodcast, unfollowPodcast } from '../../api';

class SuggestedPodcasts extends React.Component {
	componentDidMount() {
		if (!this.props.suggestedPodcasts.length)
			getSuggestedPodcasts(this.props.dispatch);
	}

	render() {
		return (
			<Panel headerText="Suggested Podcasts">
				{this.props.suggestedPodcasts.map((podcast) => {
					const id = podcast._id;
					const favicon = podcast.images ? podcast.images.favicon : null;
					return (
						<Link key={id} to={`/podcasts/${id}`}>
							<Img
								loader={<div className="placeholder" />}
								src={[favicon, getPlaceholderImageURL(id)]}
							/>
							<div>{podcast.title}</div>
							<div
								className={`clickable ${
									podcast.isFollowed ? 'active' : ''
								}`}
								onClick={(e) => {
									e.preventDefault();
									podcast.isFollowed
										? unfollowPodcast(this.props.dispatch, id)
										: followPodcast(this.props.dispatch, id);
								}}
							>
								Follow
							</div>
						</Link>
					);
				})}
			</Panel>
		);
	}
}

SuggestedPodcasts.defaultProps = {
	suggestedPodcasts: [],
};

SuggestedPodcasts.propTypes = {
	dispatch: PropTypes.func.isRequired,
	suggestedPodcasts: PropTypes.arrayOf(PropTypes.shape()),
};

const mapStateToProps = (state) => {
	if (!state.suggestedPodcasts) return { suggestedPodcasts: [] };

	let suggestedPodcasts = state.suggestedPodcasts;

	if (state.followedPodcasts) {
		suggestedPodcasts = suggestedPodcasts.map((item) => ({
			...item,
			isFollowed: !!state.followedPodcasts[item._id],
		}));
	}

	if (state.aliases) {
		suggestedPodcasts = suggestedPodcasts.map((item) => {
			if (state.aliases[item._id]) item.title = state.aliases[item._id].alias;
			return item;
		});
	}

	return {
		suggestedPodcasts,
	};
};

export default connect(mapStateToProps)(SuggestedPodcasts);
