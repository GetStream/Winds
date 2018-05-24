import Follow from "../models/follow"

import logger from "../utils/logger"

exports.get = (req, res) => {
    const params = req.params || {}

    if (!req.params.userId) {
        return res.sendStatus(404)
    }

    Follow.find({ followee: params.userId })
        .then(followObjects => {
            let results = followObjects.map(followObject => {
                return followObject.toObject().user
            })
            res.json(results)
        })
        .catch(err => {
            logger.error(err)
            res.status(422).send(err.errors)
        })
}
