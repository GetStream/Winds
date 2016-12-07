/**
 * LikesController
 *
 * @description :: Server-side logic for managing likes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    getLike: function(req, res) {

        sails.models.likes.findOne({
            userId: req.user.id,
            feedId: req.query.feed_id,
        }).exec(function(err, like) {
            if (err) {
                return res.negotiate(err)
            } else if (!like) {
                return res.send(204)
            } else {
                return res.send(like)
            }
        })

    },

    addLike: function(req, res) {

        let data = {
            userId: req.user.id,
            feedId: req.body.feed_id,
        }

        sails.models.likes.findOrCreate(data, data).exec(function(err, like) {
            if (err) {
                return res.negotiate(err)
            }
            return res.send(like)
        })

    },

    deleteLike: function(req, res) {

        let data = {
            userId: req.user.id,
            feedId: req.query.feed_id,
        }

        sails.models.likes.destroy(data).exec(function(err) {
            if (err) {
                return res.negotiate(err)
            }
            return res.send(204)
        })

    },

}
