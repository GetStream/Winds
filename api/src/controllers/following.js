import Follow from "../models/follow"

import logger from "../utils/logger"

exports.get = (req, res) => {
    if (req.params.userId === "undefined") {
        return res.sendStatus(404)
    }

    let params = req.params || {}
    let query = req.query || {}

    if (query.type === "user") {
        Follow.find({
            followee: { $exists: true },
            user: params.userId,
        })
            .then(follows => {
                res.json(
                    follows.map(follow => {
                        return follow.followee
                    }),
                )
            })
            .catch(err => {
                logger.error(err)
                res.status(422).send(err.errors)
            })
    } else if (query.type) {
        let obj = {
            user: params.userId,
        }

        obj[query.type] = { $exists: true }

        Follow.find(obj)
            .then(following => {
                res.json(following)
            })
            .catch(err => {
                logger.error(err)
                res.status(422).send(err.errors)
            })
    } else {
        Follow.find({ user: params.userId })
            .then(following => {
                res.json(following)
            })
            .catch(err => {
                logger.error(err)
                res.status(422).send(err.errors)
            })
    }
}
