/**
 * Follows.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    attributes: {
        type: {
            type: 'string',
            enum: ['topic', 'feed'],
        },
        feed: {
            model: 'feeds',
        },
        topic: {
            model: 'topics',
        },
        user: {
            model: 'users',
        },
    }
};