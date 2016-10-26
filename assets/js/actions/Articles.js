import * as LearningActions from 'actions/Learning'
import * as Personalization from 'actions/Personalization'

export const LOAD = 'ARTICLES_LOAD'
export const load = (page = 1, limit = 20, version = null) => dispatch => {

    let v = version || localStorage.getItem('version')

    return dispatch({
        type: LOAD,

        data: {
            limit,
            offset: (page - 1) * limit,
            version: v,
        },

        sync: {
            method: 'GET',
            url: '/api/stream/personalized',
        }
    }).then(res =>
        Promise.resolve().then(() => localStorage.setItem('version', res.response.version))
    ).then(() => dispatch(Personalization.getStats()))
}

export const CLEAR = 'ARTICLES_CLEAR'
export const clear = () => ({
    type: CLEAR,
})

export const ENGAGE = 'ARTICLES_ENGAGE'
export const engage = (id, index) => dispatch => {
    client.trackEngagement({
        label: 'click',
        content: {
            foreign_id: `articles:${id}`
        },
        position: index,
        location: 'personalized',
    })

    return dispatch({
        type: ENGAGE,

        data: {
            id,
            index,
        }
    }).then(() => dispatch(LearningActions.load())).then(() => dispatch(
        Personalization.getStats()
    ))
}

export const IMPRESSION = 'ARTICLES_IMPRESSION'
export const impression = id => (dispatch, getState) => {

    const user = getState().User

    client.trackImpression({
        content_list: [`articles:${id}`],
        feed_id: `timeline:${user.id}`,
        location: 'popular',
    })

    return dispatch({
        type: IMPRESSION,

        data: {
            id,
        },
    })
}
