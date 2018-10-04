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
		if (!this.props.bookmarks.length) getPinnedEpisodes(this.props.dispatch);
	}

	render() {
		const bookmarks = this.props.bookmarks.sort(
			(a, b) => moment(b.createdAt).valueOf() - moment(a.createdAt).valueOf(),
		);

		return (
			<Panel headerText="Bookmarks">
				{bookmarks.map((bookmark) => {
					return (
						<Link
							key={bookmark._id}
							to={`/podcasts/${bookmark.episode.podcast._id}/episodes/${
								bookmark.episode._id
							}`}
						>
							<Img
								loader={<div className="placeholder" />}
								src={[
									bookmark.episode.podcast.images.favicon,
									getPlaceholderImageURL(bookmark._id),
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

const mapStateToProps = (state) => ({
	bookmarks: state.pinnedEpisodes ? Object.values(state.pinnedEpisodes) : [],
});

export default connect(mapStateToProps)(BookmarkedEpisodes);
