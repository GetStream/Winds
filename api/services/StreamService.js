const stream          = require('getstream')
      streamNode      = require('getstream-node'),
      streamWaterline = new streamNode.WaterlineBackend(),
      jwt             = require('jsonwebtoken');

module.exports = {

    client: stream.connect(sails.config.stream.streamApiKey, sails.config.stream.streamApiSecret),

    getJwtToken: function(userId) {

        const permissions = {
            'user_id': userId,
            'resource': '*',
            'action': '*'
        }

        const token = jwt.sign(permissions, sails.config.stream.streamApiSecret, {
            algorithm: 'HS256',
            noTimestamp: true
        })

        return token

    },

    enrichActivities: function (userId, activities, callback) {

        // custom enrichment logic for activities
        async.parallel([
            callback => {

                // run enrichment, standard waterline
                // see: https://getstream.io/docs/#enrichment
                streamWaterline.enrichActivities(activities).then(function(enrichedActivities) {
                    callback(null, enrichedActivities)
                }).catch(function(err) {
                    callback(err)
                })

            }, callback => {

                // load the read state for the given user
                let articleIds = []

                activities.forEach(activity => {
                    let articleId = activity.object.split(':')[1]
                    articleIds.push(articleId)
                })

                sails.models.read.find({ user: userId, article: articleIds }).exec(function(err, reads) {
                    callback(err, reads)
                })

            }],
            function(err, results) {

                if (err) {
                    callback(err, results)
                } else {

                    let enrichedActivities = results[0],
                        reads = results[1]
                        readMap = {}

                    reads.forEach(read=> {
                        readMap[read.article] = true
                    })

                    // add a read state to old activities
                    enrichedActivities.forEach(activity => {
                        activity.read = activity.object.id in readMap
                        activity.time = activity.time + 'Z'
                    })

                    sails.log.verbose('Enriched activities successfully!')
                    callback(null, enrichedActivities)

                }
            })

    }
}
