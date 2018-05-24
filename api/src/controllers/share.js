import stream from "getstream"

import Share from "../models/share"

import config from "../config"
import logger from "../utils/logger"

const client = stream.connect(config.stream.apiKey, config.stream.apiSecret)

exports.list = (req, res) => {
    const page = parseInt(req.query.page, 10) || 0
    const perPage = parseInt(req.query.per_page, 10) || 10

    Share.find({ flags: { $lte: 5 } })
        .skip(perPage * page)
        .limit(perPage)
        .then(shares => {
            res.json(shares)
        })
        .catch(err => {
            logger.error(err)
            res.status(422).send(err.errors)
        })
}

exports.get = (req, res) => {
    if (req.params.shareId === "undefined") {
        return res.sendStatus(404)
    }

    Share.findById(req.params.shareId)
        .then(share => {
            if (!share) {
                return res.sendStatus(404)
            }

            res.json(share)
        })
        .catch(err => {
            logger.error(err)
            res.status(422).send(err.errors)
        })
}

exports.post = (req, res) => {
    const data = Object.assign({}, req.body, { user: req.user.sub }) || {}

    Share.create(data)
        .then(share => {
            client
                .feed("user", share.user)
                .addActivity({
                    actor: share.user,
                    foreign_id: `shares:${share._id}`,
                    object: share._id,
                    time: share.createdAt,
                    verb: "share",
                })
                .then(() => {
                    if (data.hasOwnProperty("share")) {
                        Share.findByIdAndUpdate(
                            {
                                _id: share.share,
                            },
                            { $inc: { shares: 1 } },
                            {
                                new: true,
                                upsert: false,
                            },
                        )
                            .then(() => {
                                Share.findById({ _id: share._id })
                                    .then(share => {
                                        res.json(share)
                                    })
                                    .catch(err => {
                                        logger.error(err)
                                        res.status(422).send(err)
                                    })
                            })
                            .catch(err => {
                                logger.error(err)
                                res.status(422).send(err)
                            })
                    } else {
                        Share.findById({ _id: share._id })
                            .then(share => {
                                res.json(share)
                            })
                            .catch(err => {
                                logger.error(err)
                                res.status(422).send(err)
                            })
                    }
                })
                .catch(err => {
                    logger.error(err)
                    res.status(422).send(err)
                })
        })
        .catch(err => {
            logger.error(err)
            res.status(422).send(err.errors)
        })
}

exports.put = (req, res) => {
    const data = req.body || {}
    let opts = {
        new: true,
    }

    Share.findById(req.params.shareId)
        .then(share => {
            if (!share) {
                return res.sendStatus(404)
            } else if (share.user != req.user.sub) {
                // keep as !=, not !==
                return res.status(401).send()
            } else {
                return Share.update({ _id: req.params.shareId }, data, opts).then(newShare => {
                    res.json(newShare)
                })
            }
        })
        .catch(err => {
            logger.error(err)
            res.status(422).send(err.errors)
        })
}

exports.delete = (req, res) => {
    Share.findById(req.params.shareId)
        .then(share => {
            if (!share) {
                return res.status(404).send()
            } else if (share.user != req.user.sub) {
                // keep as !=, not !==
                return res.status(401).send()
            } else {
                return Share.remove({ _id: req.params.shareId }).then(() => {
                    res.sendStatus(204)
                })
            }
        })
        .catch(err => {
            logger.error(err)
            res.status(422).send(err.errors)
        })
}
