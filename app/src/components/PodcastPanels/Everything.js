import ExpandablePanel from '../ExpandablePanel';
import PropTypes from 'prop-types';
import React from 'react';
import EpisodePanelItem from '../EpisodePanelItem';

class Everything extends React.Component {
	render() {
		if (this.props.episodes.length === 0) {
			return null;
		} else {
			return (
				<ExpandablePanel className="everything">
					<ExpandablePanel.Header>
						<span>{'Everything'}</span>
						<span className="aside">{`(${
							this.props.episodes.length
						}+)`}</span>
					</ExpandablePanel.Header>

					<ExpandablePanel.Contents>
						{this.props.episodes.map(episode => {
							return (
								<EpisodePanelItem
									addEpisodeToPlaylist={this.props.addEpisodeToPlaylist}
									key={episode._id}
									playlists={this.props.playlists}
									{...episode}
								/>
							);
						})}
					</ExpandablePanel.Contents>
				</ExpandablePanel>
			);
		}
	}
}

Everything.propTypes = {
	addEpisodeToPlaylist: PropTypes.func.isRequired,
	episodes: PropTypes.arrayOf(PropTypes.shape({})),
	playlists: PropTypes.arrayOf(PropTypes.shape({})),
};

Everything.defaultProps = {
	episodes: [],
};

export default Everything;
