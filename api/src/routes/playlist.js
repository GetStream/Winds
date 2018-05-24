import Playlist from "../controllers/playlist"

module.exports = api => {
    api.route("/playlists").get(Playlist.list)
    api.route("/playlists/:playlistId").get(Playlist.get)
    api.route("/playlists").post(Playlist.post)
    api.route("/playlists/:playlistId").put(Playlist.put)
    api.route("/playlists/:playlistId").delete(Playlist.delete)
}
