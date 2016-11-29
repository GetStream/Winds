export const LOAD = 'FEED_SUGGESTIONS_LOAD'
export const load = () => ({
    type: LOAD,

    sync: {
        method: 'get',
        url: '/api/stream/suggestions',
    },
})
