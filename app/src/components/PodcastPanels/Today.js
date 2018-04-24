import PropTypes from 'prop-types';
import React from 'react';
import moment from 'moment';
import EpisodePanelItem from '../EpisodePanelItem';
import ExpandablePanel from '../ExpandablePanel';

class Today extends React.Component {
	render() {
		// filter out episodes that are >24h old
		let episodes = this.props.episodes.filter(episode => {
			// 24h -> 86400000 milliseconds
			return Date.now() - moment(episode.publicationDate).valueOf() < 86400000;
		});
		if (episodes.length === 0) {
			return null;
		}

		return (
			<ExpandablePanel className="today">
				<ExpandablePanel.Header>
					<span>Today</span>
					<span className="aside">{`(${episodes.length})`}</span>
				</ExpandablePanel.Header>
				<ExpandablePanel.Contents>
					{episodes.map(episode => {
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

Today.defaultProps = {
	episodes: [],
	playlists: [],
};

Today.propTypes = {
	addEpisodeToPlaylist: PropTypes.func.isRequired,
	episodes: PropTypes.arrayOf(PropTypes.shape({})),
	playlists: PropTypes.arrayOf(PropTypes.shape({})),
};

export default Today;
