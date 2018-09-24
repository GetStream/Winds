import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import Panel from '../Panel';
import { Link } from 'react-router-dom';
import getPlaceholderImageURL from '../../util/getPlaceholderImageURL';
import Img from 'react-image';
import TimeAgo from '../TimeAgo';
import { getPinnedEpisodes } from '../../util/pins';

class BookmarkedEpisodes extends React.Component {
	componentDidMount() {
		getPinnedEpisodes(this.props.dispatch);
	}

	render() {
		let sortedBookmarks = [...this.props.bookmarks].sort((a, b) => {
			return moment(b.createdAt).valueOf() - moment(a.createdAt).valueOf();
		});

		return (
			<Panel headerText="Bookmarks">
				{sortedBookmarks.map(bookmark => {
					return (
						<Link
							key={bookmark._id}
							to={`/podcasts/${bookmark.episode.podcast._id}/episodes/${
								bookmark.episode._id
							}`}
						>
							<Img
								src={[
									bookmark.episode.podcast.images.favicon,
									getPlaceholderImageURL(bookmark.episode.podcast._id),
								]}
								loader={<div className="placeholder" />}
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
