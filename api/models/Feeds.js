/**
 * Feeds.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    attributes: {
        feedUrl: {
            type: 'string',
            required: true,
            unique: true,
        },
        title: {
            type: 'string',
        },
        site: {
            model: 'sites'
        },
        topic: {
            model: 'topics'
        },
        lastScraped: {
            type: 'datetime'
        },
        toJSON: function() {
            let obj = this.toObject()
            obj.feedToken = StreamService.client.feed('rss_feed', this.id).getReadOnlyToken()
            return obj
        },
    },
};
