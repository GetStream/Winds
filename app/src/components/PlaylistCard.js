import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import React from 'react';
import getPlaceholderImageURL from '../util/getPlaceholderImageURL';

class PlaylistCard extends React.Component {
	render() {
		return (
			<Link
				className="playlist-card"
				style={{
					backgroundImage: `url(${getPlaceholderImageURL(
						this.props.playlistID,
					)})`,
				}}
				to={`/playlists/${this.props.playlistID}`}
			>
				{this.props.children}
			</Link>
		);
	}
}

PlaylistCard.defaultProps = {};

PlaylistCard.propTypes = {
	children: PropTypes.string,
	playlistID: PropTypes.string.isRequired,
};

export default PlaylistCard;
