import forwardWhiteIcon from '../images/icons/forward-white.svg';
import whiteLikeIcon from '../images/icons/like-white.svg';
import addIcon from '../images/icons/add.svg';
import getPlaceholderImageURL from './../util/getPlaceholderImageURL';
import TimeAgo from './TimeAgo';
import { Link } from 'react-router-dom';
import Img from 'react-image';
import React from 'react';
import PropTypes from 'prop-types';
import Popover from 'react-popover';
import MediaCard from './MediaCard';

class EpisodePanelItem extends React.Component {
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
									this.props._id,
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
					author={this.props.podcast.title}
					image={
						this.props.podcast.images.favicon ||
						getPlaceholderImageURL(this.props.podcast._id)
					}
					link={`/podcasts/${this.props.podcast._id}`}
					title={this.props.title}
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
				<div className="description">{this.props.description}</div>
				<Link className="podcast" to={`/podcasts/${this.props.podcast._id}`}>
					<div className="left">{this.props.podcast.title}</div>
					<Img className="right" src={forwardWhiteIcon} />
				</Link>
			</div>
		);

		return (
			<Link
				className="panel-element"
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
				to={`/podcasts/${this.props.podcast._id}`}
			>
				<div className="left">
					<Img
						src={[
							this.props.podcast.images.favicon,
							getPlaceholderImageURL(this.props.podcast._id),
						]}
					/>
				</div>
				<div className="center">{this.props.title}</div>
				<div className="right">
					<TimeAgo timestamp={this.props.publicationDate} />
				</div>
				<Popover
					body={popoverBody}
					isOpen={this.state.popoverIsOpen}
					tipSize={0.01}
				>
					<div />
				</Popover>
			</Link>
		);
	}
}

EpisodePanelItem.defaultProps = {
	likes: 0,
};

EpisodePanelItem.propTypes = {
	_id: PropTypes.string.isRequired,
	addEpisodeToPlaylist: PropTypes.func.isRequired,
	description: PropTypes.string,
	likes: PropTypes.number,
	playlists: PropTypes.arrayOf(PropTypes.shape({})),
	podcast: PropTypes.shape({
		_id: PropTypes.string.isRequired,
		images: PropTypes.shape({
			favicon: PropTypes.string,
		}),
		title: PropTypes.string.isRequired,
	}).isRequired,
	publicationDate: PropTypes.string.isRequired,
	title: PropTypes.string.isRequired,
};

export default EpisodePanelItem;
