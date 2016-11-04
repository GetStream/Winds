/**
 * TopicsController
 *
 * @description :: Server-side logic for managing topics
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    readTopics: function(req, res, next) {

        async.parallel([

            callback => {
                sails.models.topics.find().exec(function(err, topics) {
                    callback(err, topics)
                })
            },
            callback => {

                if (!req.user) return callback(null, [])

                sails.models.follows.find({
                    user: req.user.id,
                    type: 'topic'
                }).exec(function(err, follows) {
                    callback(err, follows)
                })

        }], function(err, results) {

            if (err) {
                return res.serverError('Failed to read topics.')
            }

            let topics = results[0],
                follows = results[1],
                followMap = {}

            follows.forEach(follow => {
                followMap[follow.topic] = true
            })

            topics.forEach(topic => {
                topic.followed = topic.id in followMap
            })

            return res.ok(topics)

        })
    },

};
