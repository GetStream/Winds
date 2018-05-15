import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import fetch from '../../util/fetch';
import Panel from '../Panel';
import { Link } from 'react-router-dom';
import getPlaceholderImageURL from '../../util/getPlaceholderImageURL';
import Img from 'react-image';
import TimeAgo from '../TimeAgo';

class BookmarkedEpisodes extends React.Component {
	componentDidMount() {
		fetch('GET', '/pins', null, { type: 'episode' }).then(response => {
			for (let pin of response.data) {
				// dispatch update to podcast
				this.props.dispatch({
					podcast: pin.episode.podcast,
					type: 'UPDATE_PODCAST_SHOW',
				});
				// dispatch updates to episodes
				this.props.dispatch({
					episode: pin.episode,
					type: 'UPDATE_EPISODE',
				});
				// dispatch updates to pins
				this.props.dispatch({
					pin,
					type: 'PIN_EPISODE',
				});
			}
		});
	}
	render() {
		return (
			<Panel headerText="Bookmarks">
				{this.props.bookmarks.map(bookmark => {
					return (
						<Link
							key={bookmark._id}
							to={`/podcasts/${bookmark.episode.podcast._id}`}
						>
							<Img
								src={[
									bookmark.episode.podcast.images.favicon,
									getPlaceholderImageURL(bookmark.episode.podcast._id),
								]}
							/>
							<div>{bookmark.episode.title}</div>
							<TimeAgo
								className="muted"
								timestamp={bookmark.episode.publicationDate}
								trim={true}
							/>
						</Link>
					);
				})}
			</Panel>
		);
	}
}

BookmarkedEpisodes.defaultProps = {
	bookmarks: [],
};

BookmarkedEpisodes.propTypes = {
	bookmarks: PropTypes.arrayOf(PropTypes.shape()),
	dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = (state, ownProps) => {
	let bookmarks = [];
	for (let episodeID in state.pinnedEpisodes) {
		if (state.pinnedEpisodes.hasOwnProperty(episodeID)) {
			if (state.pinnedEpisodes[episodeID]) {
				let pin = { ...state.pinnedEpisodes[episodeID] };
				pin.episode = { ...state.episodes[episodeID] };
				pin.episode.podcast = { ...state.podcasts[pin.episode.podcast] };
				bookmarks.push(pin);
			}
		}
	}

	return { ...ownProps, bookmarks };
};

export default connect(mapStateToProps)(BookmarkedEpisodes);
