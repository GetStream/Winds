import async from "async"
import stream from "getstream"

import Pin from "../models/pin"

import config from "../config"
import logger from "../utils/logger"
import events from "../utils/events"

const client = stream.connect(config.stream.apiKey, config.stream.apiSecret)

exports.list = (req, res) => {
    const query = req.query || {}

    if (query.type == "episode" || query.type == "article") {
        let obj = {}
        obj[query.type] = { $exists: true }

        if (query.user) {
            obj["user"] = query.user
        }

        Pin.find(obj)
            .then(pins => {
                res.json(pins)
            })
            .catch(err => {
                logger.error(err)
                res.status(422).send(err.errors)
            })
    } else {
        Pin.apiQuery(req.query)
            .then(pins => {
                res.json(pins)
            })
            .catch(err => {
                logger.error(err)
                res.status(422).send(err.errors)
            })
    }
}

exports.get = (req, res) => {
    if (req.params.pinId == "undefined") {
        return res.sendStatus(404)
    }

    Pin.findById(req.params.pinId)
        .then(pin => {
            if (!pin) {
                return res.sendStatus(404)
            }

            res.json(pin)
        })
        .catch(err => {
            logger.error(err)
            res.status(422).send(err.errors)
        })
}

exports.post = (req, res) => {
    const data = Object.assign({}, req.body, { user: req.user.sub }) || {}

    let type

    if (data.hasOwnProperty("article")) {
        type = "article"
    } else if (data.hasOwnProperty("episode")) {
        type = "episode"
    } else {
        return res.status(422).send(err)
    }

    let obj = {
        user: data.user,
    }

    obj[type] = { $exists: true }
    obj[type] = data[type]

    async.waterfall(
        [
            cb => {
                Pin.findOne(obj)
                    .then(exists => {
                        if (exists) {
                            return res.sendStatus(409)
                        }

                        cb(null)
                    })
                    .catch(err => {
                        cb(err)
                    })
            },
            cb => {
                Pin.create(data)
                    .then(pin => {
                        cb(null, pin)
                    })
                    .catch(err => {
                        cb(err)
                    })
            },
            (pin, cb) => {
                client
                    .feed("user", pin.user)
                    .addActivity({
                        actor: pin.user,
                        verb: "pin",
                        object: pin._id,
                        foreign_id: `pins:${pin._id}`,
                        time: pin.createdAt,
                    })
                    .then(() => {
                        cb(null, pin)
                    })
                    .catch(err => {
                        cb(err)
                    })
            },
            (pin, cb) => {
                Pin.findOne({ _id: pin._id })
                    .then(pin => {
                        cb(null, pin)
                    })
                    .catch(err => {
                        cb(err)
                    })
            },
            (pin, cb) => {
                events({
                    user: pin.user._id,
                    email: pin.user.email.toLowerCase(),
                    engagement: {
                        label: "pin",
                        content: {
                            foreign_id: `${type}:${pin[type]._id}`,
                        },
                    },
                })
                    .then(() => {
                        cb(null, pin)
                    })
                    .catch(err => {
                        cb(err)
                    })
            },
        ],
        (err, pin) => {
            if (err) {
                logger.error(err)
                return res.status(422).send(err)
            }
            res.json(pin)
        },
    )
}

exports.delete = (req, res) => {
    let pinId = req.params.pinId
    Pin.findById(pinId)
        .then(pin => {
            if (!pin) {
                res.status(404).send(`Couldn't find pin with id ${pinId}`)
                return
            } else if (pin.user._id != req.user.sub) {
                res.status(401).send(`User ${req.user.sub} is not the owner of pin ${pinId}`)
                return
            } else {
                return Pin.remove({ _id: req.params.pinId }).then(() => {
                    res.status(204).send(`Removed pin with id ${pinId}`)
                })
            }
        })
        .catch(err => {
            logger.error(err)
            res.status(422).send(err.errors)
        })
}
