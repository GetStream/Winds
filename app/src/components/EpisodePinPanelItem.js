import forwardWhiteIcon from '../images/icons/forward-white.svg';
import whiteLikeIcon from '../images/icons/like-white.svg';
import pinIcon from '../images/icons/pin.svg';
import addIcon from '../images/icons/add.svg';
import getPlaceholderImageURL from './../util/getPlaceholderImageURL';
import TimeAgo from './TimeAgo';
import { Link } from 'react-router-dom';
import Img from 'react-image';
import React from 'react';
import PropTypes from 'prop-types';
import Popover from 'react-popover';
import { withRouter } from 'react-router-dom';
import MediaCard from './MediaCard';

class EpisodePinPanelItem extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			addToPlaylistPopoverIsOpen: false,
			popoverIsOpen: false,
		};
	}
	render() {
		let addToPlaylistPopoverBody = (
			<div className="list">
				{this.props.playlists.map(playlist => {
					return (
						<div
							className="list-item"
							key={playlist._id}
							onClick={e => {
								e.preventDefault();
								e.stopPropagation();
								// now, do the thing where we append to the specified playlist
								this.props.addEpisodeToPlaylist(
									this.props.pin.episode._id,
									playlist._id,
								);
								this.setState({
									addToPlaylistPopoverIsOpen: false,
								});
							}}
						>
							{playlist.name}
						</div>
					);
				})}
			</div>
		);

		let popoverBody = (
			<div className="episode-info-popover">
				<MediaCard
					author={this.props.pin.episode.podcast.title}
					image={
						this.props.pin.episode.podcast.images.favicon ||
						getPlaceholderImageURL(this.props.pin.episode.podcast._id)
					}
					link={`/podcasts/${this.props.pin.episode.podcast._id}`}
					title={this.props.pin.episode.title}
					type="episode"
				/>

				<div className="action-bar">
					<div className="hearts">
						<Img src={whiteLikeIcon} />
						<span>{this.props.likes}</span>
					</div>
					<Popover
						body={addToPlaylistPopoverBody}
						className="add-to-playlist-popover popover"
						isOpen={this.state.addToPlaylistPopoverIsOpen}
						preferPlace="below"
						tipSize={0.1}
					>
						<div
							className="playlist-button"
							onClick={e => {
								e.preventDefault();
								e.stopPropagation();
								this.setState({
									addToPlaylistPopoverIsOpen: true,
								});
							}}
						>
							<Img src={addIcon} />
						</div>
					</Popover>
				</div>
				<div className="description">{this.props.pin.episode.description}</div>
				<Link
					className="podcast"
					to={`/podcasts/${this.props.pin.episode.podcast._id}`}
				>
					<div className="left">{this.props.pin.episode.podcast.title}</div>
					<Img className="right" src={forwardWhiteIcon} />
				</Link>
			</div>
		);

		return (
			<div
				className="panel-element clickable"
				onClick={() => {
					this.props.history.push(
						`/podcasts/${this.props.pin.episode.podcast._id}`,
					);
					this.props.playEpisode(
						this.props.pin.episode._id,
						this.props.pin.episode.podcast._id,
					);
				}}
				onMouseEnter={() => {
					this.setState({
						popoverIsOpen: true,
					});
				}}
				onMouseLeave={() => {
					this.setState({
						addToPlaylistPopoverIsOpen: false,
						popoverIsOpen: false,
					});
				}}
				to={`/podcasts/${this.props.pin.episode.podcast._id}`}
			>
				<div className="left">
					<Img
						src={[
							this.props.pin.episode.podcast.images.favicon,
							getPlaceholderImageURL(this.props.pin.episode.title),
						]}
					/>
				</div>
				<div className="center">{this.props.pin.episode.title}</div>
				<div
					className="right"
					onClick={e => {
						e.preventDefault();
						e.stopPropagation();
						this.props.unpinEpisode(
							this.props.pin._id,
							this.props.pin.episode._id,
						);
					}}
				>
					<TimeAgo timestamp={this.props.pin.episode.publicationDate} />
					<Img className="pin" src={pinIcon} />
				</div>

				<Popover
					body={popoverBody}
					isOpen={this.state.popoverIsOpen}
					tipSize={0.01}
				>
					<div />
				</Popover>
			</div>
		);
	}
}

EpisodePinPanelItem.defaultProps = {
	likes: 0,
	playlists: [],
};

EpisodePinPanelItem.propTypes = {
	addEpisodeToPlaylist: PropTypes.func.isRequired,
	history: PropTypes.shape({
		push: PropTypes.func.isRequired,
	}).isRequired,
	likes: PropTypes.number,
	pin: PropTypes.shape({
		_id: PropTypes.string.isRequired,
		episode: PropTypes.shape({
			_id: PropTypes.string.isRequired,
			description: PropTypes.string,
			podcast: PropTypes.shape({
				_id: PropTypes.string.isRequired,
				images: PropTypes.shape({
					favicon: PropTypes.string,
				}),
				title: PropTypes.string,
			}).isRequired,
			publicationDate: PropTypes.string,
			title: PropTypes.string,
		}).isRequired,
	}).isRequired,
	playEpisode: PropTypes.func.isRequired,
	playlists: PropTypes.arrayOf(PropTypes.shape({})),
	unpinEpisode: PropTypes.func.isRequired,
};

export default withRouter(EpisodePinPanelItem);
