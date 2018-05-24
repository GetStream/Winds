import Comment from "../models/comment"
import Share from "../models/share"

import config from "../config"
import logger from "../utils/logger"

exports.list = (req, res) => {
    Comment.apiQuery(req.query)
        .then(comments => {
            res.json(comments)
        })
        .catch(err => {
            logger.error(err)
            res.status(422).send(err.errors)
        })
}

exports.get = (req, res) => {
    if (req.params.commentId == "undefined") {
        return res.sendStatus(404)
    }

    Comment.findById(req.params.commentId)
        .then(comment => {
            if (!comment) {
                return res.sendStatus(404)
            }

            res.json(comment)
        })
        .catch(err => {
            logger.error(err)
            res.status(422).send(err.errors)
        })
}

exports.post = (req, res) => {
    const data = Object.assign(req.body, { user: req.user.sub }) || {}

    // create the comment
    // update the comment counter on the share
    Promise.all([
        Comment.create(data),
        Share.findByIdAndUpdate(
            {
                _id: data.share,
            },
            { $inc: { comments: 1 } },
            {
                new: false,
                upsert: false,
            },
        ),
    ])
        .then(results => {
            res.json(results[0]) // send back created comment
        })
        .catch(err => {
            logger.error(err)
            return res.status(422).send(err)
        })
}

exports.put = (req, res) => {
    const data = req.body || {}
    let opts = {
        new: true,
    }

    // need to only allow updating if user in jwt matches user on comment
    // OR, if the only thing that's being updated is the flags count

    Comment.findById({ _id: req.params.commentId })
        .then(comment => {
            if (!comment) {
                return res.sendStatus(404)
            } else {
                // if it's just updating the flags, or the user matches, update the comment
                if (data.flags || comment.user === res.sub.user) {
                    Comment.findByIdAndUpdate({ _id: req.params.commentId }, data, opts).then(
                        comment => {
                            return res.json(comment)
                        },
                    )
                } else {
                    // else, unauthorized
                    return res.status(401).send("You're not authorized to edit this comment.")
                }
            }
        })
        .catch(err => {
            logger.error(err)
            res.status(422).send(err.errors)
        })
}
