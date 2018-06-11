import Playlist from '../controllers/playlist';
import { wrapAsync } from '../utils/controllers';

module.exports = api => {
	api.route('/playlists').get(wrapAsync(Playlist.list));
	api.route('/playlists/:playlistId').get(wrapAsync(Playlist.get));
	api.route('/playlists').post(wrapAsync(Playlist.post));
	api.route('/playlists/:playlistId').put(wrapAsync(Playlist.put));
	api.route('/playlists/:playlistId').delete(wrapAsync(Playlist.delete));
};
