export const LOAD = 'LOAD'
export const load = (feed_id) => ({
    type: LOAD,

    sync: {
        method: 'get',
        url: '/api/like?feed_id=' + feed_id,
    },
})

export const LIKE = 'LIKE'
export const like = (feed_id) => ({
    type: LIKE,

    data: {
        feed_id: feed_id,
    },

    sync: {
        method: 'post',
        url: '/api/like',
    },
})

export const UNLIKE = 'UNLIKE'
export const unlike = (feed_id) => ({
    type: UNLIKE,

    sync: {
        method: 'delete',
        url: '/api/like?feed_id=' + feed_id,
    },
})
