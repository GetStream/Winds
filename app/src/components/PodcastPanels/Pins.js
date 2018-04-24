import ExpandablePanel from '../ExpandablePanel';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import EpisodePinPanelItem from '../EpisodePinPanelItem';

class Pins extends Component {
	render() {
		if (this.props.pins.length === 0) {
			return null;
		} else {
			return (
				<ExpandablePanel className="pins">
					<ExpandablePanel.Header>
						<span>{'Pins'}</span>
					</ExpandablePanel.Header>
					<ExpandablePanel.Contents>
						{this.props.pins.map(pin => {
							return (
								<EpisodePinPanelItem
									addEpisodeToPlaylist={this.props.addEpisodeToPlaylist}
									key={pin._id}
									pin={pin}
									playEpisode={this.props.playEpisode}
									playlists={this.props.playlists}
									unpinEpisode={this.props.unpinEpisode}
								/>
							);
						})}
					</ExpandablePanel.Contents>
				</ExpandablePanel>
			);
		}
	}
}

Pins.defaultProps = {
	pins: [],
};

Pins.propTypes = {
	addEpisodeToPlaylist: PropTypes.func.isRequired,
	pins: PropTypes.arrayOf(PropTypes.shape({})),
	playEpisode: PropTypes.func.isRequired,
	playlists: PropTypes.arrayOf(PropTypes.shape({})),
	unpinEpisode: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch, ownProps) => {
	return {
		playEpisode: (episodeID, podcastID) => {
			dispatch({
				contextID: podcastID,
				contextPosition: 100000,
				contextType: 'podcast',
				episodeID: episodeID,
				type: 'PLAY_EPISODE',
			});
		},
		...ownProps,
	};
};

export default connect(null, mapDispatchToProps)(withRouter(Pins));
