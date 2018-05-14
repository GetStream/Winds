import getPlaceholderImageURL from '../util/getPlaceholderImageURL';
import inactivePinLogo from '../images/icons/pin-inactive.svg';
import Img from 'react-image';
import PropTypes from 'prop-types';
import React from 'react';
import moment from 'moment';
import pauseIcon from '../images/icons/pause.svg';
import playIcon from '../images/icons/play.svg';
import pinIcon from '../images/icons/pin.svg';
import { withRouter } from 'react-router-dom';

class EpisodeListItem extends React.Component {
	constructor(props) {
		super(props);
		this.state = { addToPlaylistPopoverIsOpen: false };
		this.toggleAddToPlaylistPopover = this.toggleAddToPlaylistPopover.bind(this);
	}
	toggleAddToPlaylistPopover() {
		this.setState({
			addToPlaylistPopoverIsOpen: !this.state.addToPlaylistPopoverIsOpen,
		});
	}
	render() {
		let icon;
		if (this.props.active) {
			icon = (
				<div className="pause-icon">
					<div className="icon-container">
						{this.props.playing ? (
							<Img src={pauseIcon} />
						) : (
							<Img src={playIcon} />
						)}
					</div>
				</div>
			);
		} else {
			icon = (
				<div className="play-icon">
					<div className="icon-container">
						<Img src={playIcon} />
					</div>
				</div>
			);
		}

		return (
			<div
				className="list-item podcast-episode"
				onClick={() => {
					if (this.props.playable) {
						this.props.playOrPauseEpisode();
					} else {
						this.props.history.push(`/podcasts/${this.props.podcast._id}`);
					}
				}}
			>
				<div className="left">
					<Img
						height="100"
						src={[
							this.props.images.og,
							this.props.podcast.images.featured,
							getPlaceholderImageURL(this.props.podcast._id),
						]}
						width="100"
					/>
					{this.props.playable ? icon : null}
				</div>
				<div className="right">
					<h2>{`${this.props.title}`}</h2>
					<div className="info">
						<span
							onClick={e => {
								e.preventDefault();
								e.stopPropagation();
								if (this.props.pinned) {
									this.props.unpinEpisode();
								} else {
									this.props.pinEpisode();
								}
							}}
						>
							{this.props.pinned ? (
								<Img src={pinIcon} />
							) : (
								<Img src={inactivePinLogo} />
							)}
						</span>
						<span className="date">
							{moment(this.props.publicationDate).format('MMM DD, YYYY')}
						</span>
					</div>
					<div className="description">{this.props.description}</div>
				</div>
			</div>
		);
	}
}

EpisodeListItem.defaultProps = {
	liked: false,
	likes: 0,
	pinned: false,
	playable: false,
	playing: false,
};

EpisodeListItem.propTypes = {
	_id: PropTypes.string.isRequired,
	active: PropTypes.bool,
	description: PropTypes.string,
	history: PropTypes.shape({
		push: PropTypes.func.isRequired,
	}).isRequired,
	images: PropTypes.shape({
		og: PropTypes.string,
	}),
	pinEpisode: PropTypes.func.isRequired,
	pinned: PropTypes.bool,
	playOrPauseEpisode: PropTypes.func,
	playable: PropTypes.bool,
	playing: PropTypes.bool,
	podcast: PropTypes.shape({
		_id: PropTypes.string.isRequired,
		images: PropTypes.shape({
			featured: PropTypes.string,
		}),
	}).isRequired,
	publicationDate: PropTypes.string,
	title: PropTypes.string,
	unpinEpisode: PropTypes.func.isRequired,
};

export default withRouter(EpisodeListItem);
