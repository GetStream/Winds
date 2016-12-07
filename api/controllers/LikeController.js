/**
 * LikesController
 *
 * @description :: Server-side logic for managing likes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    getLike: function(req, res) {

        let userId = req.user.id,
            feedId = req.query.feed_id

        console.log('GET', user_id, feed_id)

        res.send(200)

    },

    addLike: function(req, res) {

        let userId = req.user.id,
            feedId = req.query.feed_id

        console.log('ADD', user_id, feed_id)

        res.send(201)

    },

    deleteLike: function(req, res) {

        let userId = req.user.id,
            feedId = req.query.feed_id

        console.log('DEL', user_id, feed_id)

        res.send(201)

    },

};
