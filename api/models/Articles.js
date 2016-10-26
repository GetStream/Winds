/**
 * Articles.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

var streamNode = require('getstream-node'),
    streamWaterline = new streamNode.WaterlineBackend();

module.exports = {
    attributes: {
        // unique identifier
        articleUrl: {
            type: 'url',
            required: true
        },
        // relations
        feed: {
            model: 'feeds'
        },
        site: {
            model: 'sites'
        },
        topic: {
            model: 'topics'
        },
        // other fields for display
        title: {
            type: 'string',
            required: true,
        },
        summary: {
            type: 'text',
            defaultsTo: '',
        },
        description: {
            type: 'text',
            defaultsTo: '',
        },
        author: {
            type: 'string'
        },
        publicationDate: {
            type: 'datetime',
            required: true,
            defaultsTo: new Date(),
        },
        imageSrc: {
            type: 'url',
            required: true
        },
        categories: {
            type: 'array',
            defaultsTo: []
        },
        // popularity related Fields
        canonicalUrl: {
            type: 'url',
            required: true
        },

        toActivity: function() {

            let activity = {
                actor: 'feed:' + this.feed,
                verb: 'publish',
                object: 'articles:' + this.id,
                foreign_id: 'articles:' + this.id,
                time: this.publicationDate,
                // info for personalization
                site: 'sites:' + this.site,
                feed: 'feeds:' + this.feed,
                categories: this.categories,
                title: this.title,
                summary: this.summary,
                author: this.author,
                articleUrl: this.articleUrl,
                canonicalUrl: this.canonicalUrl
            }

            if (this.topic) {
                activity.to = [`topic:${this.topic}`]
                activity.topic = 'topics:' + this.topic
            }

            return activity;

        }
    },


};
