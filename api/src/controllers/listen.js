import Listen from "../models/listen"
import User from "../models/user"

import config from "../config"
import logger from "../utils/logger"
import events from "../utils/events"

exports.list = (req, res) => {
    Listen.apiQuery(req.query)
        .then(listens => {
            res.json(listens)
        })
        .catch(err => {
            logger.error(err)
            res.status(422).send(err.errors)
        })
}

exports.get = (req, res) => {
    if (req.params.listenId == "undefined") {
        return res.sendStatus(404)
    }

    Listen.findById(req.params.listenId)
        .then(listen => {
            if (!listen) {
                return res.sendStatus(404)
            }

            res.json(listen)
        })
        .catch(err => {
            logger.error(err)
            res.status(422).send(err.errors)
        })
}

exports.post = (req, res) => {
    const data = Object.assign({}, req.body, { user: req.user.sub }) || {}

    Listen.findOneAndUpdate(
        { user: data.user, episode: data.episode },
        { $set: data },
        { new: true, upsert: true },
    )
        .then(listen => {
            User.findById(data.user)
                .then(user => {
                    events({
                        user: user._id,
                        email: user.email.toLowerCase(),
                        engagement: {
                            label: "listen",
                            content: {
                                foreign_id: `episode:${listen.episode}`,
                                duration: listen.duration,
                            },
                        },
                    })
                        .then(() => {
                            res.json(listen)
                        })
                        .catch(err => {
                            logger.error(err)
                            res.sendStatus(503)
                        })
                })
                .catch(err => {
                    logger.error(err)
                    res.sendStatus(422)
                })
        })
        .catch(err => {
            logger.error(err)
            res.status(422).send(err.errors)
        })
}

exports.delete = (req, res) => {
    Listen.findById(req.params.listenId)
        .then(listen => {
            if (!listen) {
                res.status(404).send()
                return
            } else if (listen.user !== req.user.sub) {
                res.status(401).send("You aren't authorized to delete that listen.")
                return
            } else {
                return Listen.remove({ _id: req.params.listenId }).then(() => {
                    res.status(204).send()
                })
            }
        })
        .catch(err => {
            logger.error(err)
            res.status(422).send(err.errors)
        })
}
