export const OPEN = 'PERSONALIZATION_OPEN'
export const open = () => dispatch => {
    localStorage.removeItem('personalizationClosed')
    return dispatch({ type: OPEN, })
}

export const CLOSE = 'PERSONALIZATION_CLOSE'
export const close = () => dispatch => {
    localStorage.setItem('personalizationClosed', true)
    return dispatch({ type: CLOSE, })
}

export const TOGGLE = 'PERSONALIZATION_TOGGLE'
export const toggle = () => (dispatch, getState) => {

    const { Personalization } = getState()

    if (Personalization.open) {
        localStorage.removeItem('personalizationClosed')
    } else {
        localStorage.setItem('personalizationClosed', true)
    }

    return dispatch({ type: TOGGLE, })
}

export const GET_STATS = 'PERSONALIZATION_GET_STATS'
export const getStats = () => ({
    type: GET_STATS,

    sync: {
        method: 'GET',
        url: '/api/stream/event_counts',
    },
})
