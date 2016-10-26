export const LOAD = 'SITES_LOAD'
export const load = () => ({
    type: LOAD,

    data: {
        type: 'feed',
    },

    sync: {
        method: 'GET',
        url: '/api/follows'
    }
})

export const UNSUBSCRIBE = 'SITE_UNSUBSCRIBE'
export const unsubscribe = id => ({
    type: UNSUBSCRIBE,

    data: { feed_id: id, },

    sync: {
        method: 'post',
        url: '/api/unfollow',
    }
})

export const LOAD_ARTICLES = 'SITES_LOAD_ARTICLES'
export const loadArticles = (feed, id_lt = null) => ({
    type: LOAD_ARTICLES,

    data: { feed, id_lt, },

    sync: {
        method: 'get',
        url: '/api/stream/feed',
    }
})

export const CLEAR_ARTICLES = 'SITES_CLEAR_ARTICLES'
export const clearArticles = () => ({
    type: CLEAR_ARTICLES,
})
