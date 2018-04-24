import partialIcon from '../images/icons/partial.svg';
import EditPlaylistModal from '../components/EditPlaylistModal';
import Img from 'react-image';
import Loader from '../components/Loader';
import NewShareForm from '../components/NewShareForm';
import PropTypes from 'prop-types';
import React from 'react';
import TimeAgo from '../components/TimeAgo';
import { connect } from 'react-redux';
import fetch from '../util/fetch';
import getPlaceholderImageURL from '../util/getPlaceholderImageURL';
import Dragula from 'react-dragula';

class PlaylistView extends React.Component {
	constructor(props) {
		super(props);
		this.state = { editPlaylistModalIsOpen: false };
		this.toggleEditPlaylistModal = this.toggleEditPlaylistModal.bind(this);
		this.dragulaDecorator = this.dragulaDecorator.bind(this);
	}
	componentDidMount() {
		this.props.getPlaylistInfo();
	}
	toggleEditPlaylistModal() {
		this.setState({
			editPlaylistModalIsOpen: !this.state.editPlaylistModalIsOpen,
		});
	}
	dragulaDecorator(componentBackingInstance) {
		if (componentBackingInstance) {
			let options = {};
			let drake = Dragula([componentBackingInstance], options);
			drake.on('drop', (el, target) => {
				let newOrder = Array.from(target.children).map(child => {
					return child.dataset.id;
				});
				fetch('PUT', `/playlists/${this.props.playlistID}`, {
					episodes: newOrder,
				}).then(response => {
					this.props.updatePlaylist(response.data);
				});
			});
		}
	}
	render() {
		if (this.props.loading) {
			return <Loader />;
		}
		let pattern = getPlaceholderImageURL(this.props.playlistID);

		let episodeList = (
			<div ref={this.dragulaDecorator}>
				{this.props.episodes.map((episode, i) => {
					let pattern = getPlaceholderImageURL(episode.show._id);
					let active = false;
					if (
						this.props.context.contextID === this.props._id &&
						i === this.props.context.contextPosition
					) {
						active = true;
					}

					return (
						<div
							className={`episode-row ${active ? 'active' : ''}`}
							data-id={episode._id}
							key={`${episode._id}-${i}`}
						>
							<div className="episode-info">
								<span className="playlist-episode-order-number">
									{i + 1}
								</span>
								<span>
									<Img height={25} src={pattern} width={25} />
								</span>
								<span>{episode.title}</span>
							</div>
							<div>{episode.show.title}</div>
							<div className="time">
								<span>time</span>
								<span className="controls">
									<i aria-hidden="true" className="fa fa-plus" />
									<div
										className="play"
										onClick={() => {
											this.props.playEpisode(episode._id, i);
										}}
									>
										{active ? (
											<div>pause</div>
										) : (
											<Img src="/images/icons/play.svg" />
										)}
									</div>
								</span>
							</div>
						</div>
					);
				})}
			</div>
		);

		let emptyEpisodeList = (
			<div className="empty-playlist">
				<Img src={partialIcon} />
				<p>
					{
						'To add an episode, click the (+) next to the episode and then select this playlist'
					}
				</p>
			</div>
		);

		return (
			<div className="two-columns playlist-view">
				<div className="left column">
					<div
						className="hero-card"
						style={{
							backgroundImage: `linear-gradient(to right top, rgba(0, 0, 0, 0.2), transparent), url(${pattern})`,
						}}
					>
						<h1>{this.props.name}</h1>
						<div className="info">
							<p>{`${this.props.episodes.length} episode${
								this.props.episodes.length === 1 ? '' : 's'
							}`}</p>
						</div>
						<div className="logo" />
					</div>
					<NewShareForm />
					<div />
				</div>
				<div className="right column">
					<div className="top">
						<div className="info">
							<h1>{this.props.name}</h1>
							<div className="attributes">
								<span>{`By ${this.props.user.name}`}</span>
								<span>{`${this.props.episodes.length} episode${
									this.props.episodes.length === 1 ? '' : 's'
								}`}</span>
								<span>
									<TimeAgo timestamp={this.props.updatedAt} />
								</span>
							</div>
						</div>
						<div className="controls">
							<div
								className="likes"
								onClick={() => {
									if (this.props.liked) {
										this.props.unlike();
									} else {
										this.props.like();
									}
								}}
							>
								{this.props.liked ? (
									<Img src="/images/icons/like-filled.svg" />
								) : (
									<Img src="/images/icons/like.svg" />
								)}
								<span>{this.props.likes}</span>
							</div>
							{this.props.user._id === localStorage['authedUser'] ? (
								<button
									className="btn hollow"
									onClick={this.toggleEditPlaylistModal}
								>
									Edit
								</button>
							) : null}
							<EditPlaylistModal
								closeModal={this.toggleEditPlaylistModal}
								isOpen={this.state.editPlaylistModalIsOpen}
								playlistID={this.props._id}
								playlistName={this.props.name}
							/>
							<div
								className={`play-button ${
									this.props.episodes.length > 0 ? null : 'disabled'
								}`}
							>
								<Img src="/images/icons/play.svg" />
							</div>
						</div>
					</div>
					<div className="episodes">
						<div className="episodes-heading">
							<div>Episode</div>
							<div>Show</div>
							<div>Time</div>
						</div>
						{this.props.episodes.length === 0
							? emptyEpisodeList
							: episodeList}
					</div>
				</div>
			</div>
		);
	}
}

PlaylistView.defaultProps = {
	episodes: [],
	liked: false,
	likes: 0,
	loading: true,
};

PlaylistView.propTypes = {
	_id: PropTypes.string,
	context: PropTypes.shape({
		contextID: PropTypes.string,
		contextPosition: PropTypes.number,
		contextType: PropTypes.string,
		episodeID: PropTypes.string,
	}),
	episodes: PropTypes.arrayOf(
		PropTypes.shape({
			title: PropTypes.string,
		}),
	),
	getPlaylistInfo: PropTypes.func.isRequired,
	like: PropTypes.func.isRequired,
	liked: PropTypes.bool,
	likes: PropTypes.number,
	loading: PropTypes.bool,
	name: PropTypes.string,
	playEpisode: PropTypes.func.isRequired,
	playlistID: PropTypes.string.isRequired,
	unlike: PropTypes.func.isRequired,
	updatePlaylist: PropTypes.func.isRequired,
	updatedAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
	user: PropTypes.shape({
		_id: PropTypes.string.isRequired,
		name: PropTypes.string,
	}),
};

const mapStateToProps = (state, ownProps) => {
	let playlistID = ownProps.match.params.playlistID;
	if (!(playlistID in state.playlists)) {
		return {
			loading: true,
			playlistID,
		};
	}
	let user = state.users[state.playlists[playlistID].user];
	// select playlist episodes
	let episodes = [];
	for (let episodeID of state.playlists[playlistID].episodes) {
		episodes.push({ ...state.episodes[episodeID] });
	}
	// select shows for each episode
	for (let episode of episodes) {
		episode.show = { ...state.podcasts[episode.podcast] };
	}
	let context = { ...state.player };
	return {
		...state.playlists[playlistID],
		context,
		episodes,
		loading: false,
		playlistID,
		user,
	};
};

const mapDispatchToProps = (dispatch, ownProps) => {
	let playlistID = ownProps.match.params.playlistID;

	return {
		getPlaylistInfo: () => {
			fetch('GET', `/playlists/${playlistID}`)
				.then(res => {
					// update shows
					for (let episode of res.data.episodes) {
						dispatch({
							podcast: episode.podcast,
							type: 'UPDATE_PODCAST_SHOW',
						});
					}

					// update episodes
					for (let episode of res.data.episodes) {
						dispatch({
							episode,
							type: 'UPDATE_EPISODE',
						});
					}

					// update user
					dispatch({
						type: 'UPDATE_USER',
						user: res.data.user,
					});

					// update playlist
					dispatch({
						playlist: res.data,
						type: 'UPDATE_PLAYLIST',
					});
				})
				.catch(err => {
					console.log(err); // eslint-disable-line no-console
				});
		},

		like: () => {
			// optimistic dispatch
			dispatch({
				objectID: ownProps.match.params.playlistID,
				objectType: 'playlist',
				type: 'LIKE',
			});

			fetch('POST', '/likes', {
				playlist: ownProps.match.params.playlistID,
				user: localStorage['authedUser'],
			}).catch(err => {
				// rollback on failure
				dispatch({
					objectID: ownProps.match.params.playlistID,
					objectType: 'playlist',
					type: 'UNLIKE',
				});

				console.log(err); // eslint-disable-line no-console
			});
		},
		playEpisode: (episodeID, position) => {
			dispatch({
				contextID: playlistID,
				contextPosition: position,
				contextType: 'playlist',
				episodeID: episodeID,
				type: 'PLAY_EPISODE',
			});
		},
		unlike: () => {
			// optimistic dispatch
			dispatch({
				objectID: ownProps.match.params.playlistID,
				objectType: 'playlist',
				type: 'UNLIKE',
			});
			fetch('DELETE', '/likes', null, {
				playlist: ownProps.match.params.playlistID,
				user: localStorage['authedUser'],
			}).catch(err => {
				// rollback if it fails
				dispatch({
					objectID: ownProps.match.params.playlistID,
					objectType: 'playlist',
					type: 'LIKE',
				});
				console.log(err); // eslint-disable-line no-console
			});
		},
		updatePlaylist(playlist) {
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
		},
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(PlaylistView);
