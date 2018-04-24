import Img from 'react-image';
import { Link } from 'react-router-dom';
import NewPlaylistModal from './NewPlaylistModal';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import fetch from '../util/fetch';
import getPlaceholderImageURL from '../util/getPlaceholderImageURL';
import { withRouter } from 'react-router-dom';

class MyPlaylists extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			newPlaylistModalIsOpen: false,
		};
		this.toggleNewPlaylistModal = this.toggleNewPlaylistModal.bind(this);
	}
	componentDidMount() {
		// get all playlists for this user
		this.props.getPlaylistsForUser();
	}
	toggleNewPlaylistModal() {
		this.setState({
			newPlaylistModalIsOpen: !this.state.newPlaylistModalIsOpen,
		});
	}
	render() {
		return (
			<div>
				<div className="my-playlists">
					<div className="section-heading">
						<h2>My Playlists</h2>
						<button
							className="btn primary"
							onClick={this.toggleNewPlaylistModal}
						>
							Create Playlist
						</button>
					</div>
					{this.props.playlists.map((playlist, i) => {
						let imageURL;
						if (!playlist.imageURL) {
							imageURL = getPlaceholderImageURL(playlist._id);
						} else {
							imageURL = playlist.imageURL;
						}

						let publicSpan;
						if (playlist.public) {
							publicSpan = <span>{'  ·  Public'}</span>;
						} else {
							publicSpan = null;
						}

						return (
							<Link
								className="playlist"
								key={i}
								to={`/playlists/${playlist._id}`}
							>
								<Img src={imageURL} />
								<div className="info">
									<div className="title">{playlist.name}</div>
									<div className="attributes">
										{`${playlist.episodes.length} episode${
											playlist.episodes.length === 1 ? '' : 's'
										}`}
										{publicSpan}
									</div>
								</div>
								<div className="chevron">
									<i
										aria-hidden="true"
										className="fa fa-chevron-right"
									/>
								</div>
							</Link>
						);
					})}
				</div>
				<NewPlaylistModal
					closeModal={this.toggleNewPlaylistModal}
					isOpen={this.state.newPlaylistModalIsOpen}
				/>
			</div>
		);
	}
}

MyPlaylists.defaultProps = {
	playlists: [],
};

MyPlaylists.propTypes = {
	getPlaylistsForUser: PropTypes.func.isRequired,
	playlists: PropTypes.array,
};

const mapStateToProps = (state, ownProps) => {
	// convert playlists in state to array
	let playlists = [];
	for (let playlistID in state.playlists) {
		if (state.playlists.hasOwnProperty(playlistID)) {
			// if there's a user in the URL, only take that user
			if (ownProps.match.params.userID) {
				if (state.playlists[playlistID].user === ownProps.match.params.userID) {
					playlists.push(state.playlists[playlistID]);
				}
			} else if (state.playlists[playlistID].user === localStorage['authedUser']) {
				// if there's not a user in the URL, then only include it if it's the authed user
				playlists.push(state.playlists[playlistID]);
			}
		}
	}
	return {
		...ownProps,
		playlists,
	};
};

const mapDispatchToProps = (dispatch, ownProps) => {
	return {
		...ownProps,
		getPlaylistsForUser: () => {
			fetch('GET', '/playlists', null, {
				user: ownProps.match.params.userID || localStorage['authedUser'],
			})
				.then(response => {
					for (let playlist of response.data) {
						// update shows
						for (let episode of playlist.episodes) {
							dispatch({
								podcast: episode.podcast,
								type: 'UPDATE_PODCAST_SHOW',
							});
						}

						// update episodes
						for (let episode of playlist.episodes) {
							dispatch({
								episode,
								type: 'UPDATE_EPISODE',
							});
						}

						// update user
						dispatch({
							type: 'UPDATE_USER',
							user: playlist.user,
						});

						// update playlist
						dispatch({
							playlist: playlist,
							type: 'UPDATE_PLAYLIST',
						});
					}
				})
				.catch(err => {
					console.log(err); // eslint-disable-line no-console
				});
		},
	};
};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
	return {
		...ownProps,
		...dispatchProps,
		...stateProps,
	};
};

export default withRouter(
	connect(mapStateToProps, mapDispatchToProps, mergeProps)(MyPlaylists),
);
