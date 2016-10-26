export const LOAD = 'INTEREST_PROFILE_LOAD'
export const load = () => ({
    type: LOAD,

    sync: {
        method: 'GET',
        url: '/api/stream/interest_profile'
    }
})
