import async from "async"

import Playlist from "../models/playlist"
import Like from "../models/like"

import config from "../config"
import logger from "../utils/logger"
import search from "../utils/search"

exports.list = (req, res) => {
    let query = req.query || {}

    if (query.type === "recommended") {
        Playlist.apiQuery(req.query)
            .then(playlists => {
                async.mapLimit(
                    playlists,
                    playlists.length,
                    (playlist, cb) => {
                        Like.findOne({ playlist: playlist._id, user: req.user.sub })
                            .lean()
                            .then(like => {
                                playlist = playlist.toObject()

                                if (like) {
                                    playlist.liked = true
                                } else {
                                    playlist.liked = false
                                }

                                cb(null, playlist)
                            })
                            .catch(err => {
                                cb(err)
                            })
                    },
                    (err, results) => {
                        if (err) {
                            logger.error(err)
                            return res.status(422).send(err.errors)
                        }
                        res.json(results)
                    },
                )
            })
            .catch(err => {
                logger.error(err)
                res.status(422).send(err.errors)
            })
    } else if (query.type === "featured") {
        Playlist.apiQuery(req.query)
            .then(playlists => {
                if (playlists.length === 0) {
                    res.status(204).send("No featured playlist")
                } else {
                    let random = playlists.sort(() => {
                        return 0.5 - Math.random()
                    })
                    res.json(random[0])
                }
            })
            .catch(err => {
                logger.error(err)
                res.status(422).send(err.errors)
            })
    } else {
        Playlist.apiQuery(req.query)
            .then(playlists => {
                let results = []

                async.mapLimit(
                    playlists,
                    playlists.length,
                    (playlist, cb) => {
                        Like.count({ playlist: playlist })
                            .then(likes => {
                                playlist = playlist.toObject()

                                if (likes) {
                                    playlist.likes = likes
                                } else {
                                    playlist.likes = 0
                                }

                                Like.findOne({ playlist: playlist, user: req.user.sub })
                                    .then(like => {
                                        if (like) {
                                            playlist.liked = true
                                        } else {
                                            playlist.liked = false
                                        }

                                        results.push(playlist)

                                        cb(null)
                                    })
                                    .catch(err => {
                                        cb(err)
                                    })
                            })
                            .catch(err => {
                                cb(err)
                            })
                    },
                    err => {
                        if (err) {
                            logger.error(err)
                            res.status(422).send(err.errors)
                        }

                        res.json(results)
                    },
                )
            })
            .catch(err => {
                logger.error(err)
                res.status(422).send(err.errors)
            })
    }
}

exports.get = (req, res) => {
    if (req.params.playlistId == "undefined") {
        return res.sendStatus(404)
    }

    Playlist.findById(req.params.playlistId)
        .then(playlist => {
            if (!playlist) {
                return res.sendStatus(404)
            }

            Like.findOne({ playlist: playlist._id, user: req.user.sub })
                .lean()
                .then(like => {
                    playlist = playlist.toObject()

                    if (like) {
                        playlist.liked = true
                    } else {
                        playlist.liked = false
                    }

                    res.json(playlist)
                })
                .catch(err => {
                    cb(err)
                })
        })
        .catch(err => {
            logger.error(err)
            res.status(422).send(err.errors)
        })
}

exports.post = (req, res) => {
    const data = Object.assign({}, req.body, { user: req.user.sub }) || {}
    // two things that need to happen here:
    // 1. create playlist in MongoDB
    // 1.5. retrieve new playlist from MongoDB so it autopopulates user and stuff
    // 2. add newly created playlist to Algolia

    Playlist.create(data)
        .then(playlist => {
            // retrieve newly created playlist, so that it also includes populated user and stuff
            return Playlist.findById(playlist._id)
        })
        .then(playlist => {
            // add to algolia
            return search({
                _id: playlist._id,
                episodes: playlist.episodes,
                name: playlist.name,
                type: "playlist",
                user: playlist.user,
            }).then(() => {
                return playlist
            })
        })
        .then(playlist => {
            res.json(playlist)
        })
        .catch(err => {
            logger.error(err)
            res.status(500).send(err)
        })
}

exports.put = (req, res) => {
    const data = req.body || {}
    let opts = {
        new: true,
    }
    Playlist.findById(req.params.playlistId)
        .then(playlist => {
            if (!playlist) {
                res.status(404).send()
                return
            } else if (playlist.user._id != req.user.sub) {
                // @kenhoff - needs to be ==, not === here
                res.status(401).send()
                return
            } else {
                return Playlist.update({ _id: req.params.playlistId }, data, opts).then(() => {
                    // this next bit is from @kenhoff - for some reason, findByIdAndUpdate wasn't autopopulating the `user` field
                    return Playlist.findOne({ _id: req.params.playlistId }).then(playlist => {
                        return res.json(playlist)
                    })
                })
            }
        })
        .catch(err => {
            logger.error(err)
            res.status(422).send(err.errors)
        })
}

exports.delete = (req, res) => {
    Playlist.findById(req.params.playlistId)
        .then(playlist => {
            if (!playlist) {
                res.status(404).send()
                return
            } else if (playlist.user._id != req.user.sub) {
                // @kenhoff - needs to be ==, not ===
                res.status(401).send()
                return
            } else {
                return Playlist.remove({ _id: req.params.playlistId }).then(() => {
                    return res.status(204).send()
                })
            }
        })
        .catch(err => {
            logger.error(err)
            res.status(422).send(err.errors)
        })
}
