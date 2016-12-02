export const LOAD = 'FEED_SUGGESTIONS_LOAD'
export const load = () => ({
    type: LOAD,

    sync: {
        method: 'get',
        url: '/api/stream/suggestions',
    },
})

export const FOLLOW = 'FEED_SUGGESTIONS_FOLLOW'
export const follow = (feed_id) => ({
    type: FOLLOW,

    data: {
        feed_id: feed_id,
    },

    sync: {
        method: 'put',
        url: '/api/stream/suggestions?follow=true',
    },
})

export const REMOVE = 'FEED_SUGGESTIONS_REMOVE'
export const remove = (feed_id) => ({
    type: REMOVE,

    data: {
        feed_id: feed_id,
    },

    sync: {
        method: 'put',
        url: '/api/stream/suggestions',
    },
})
