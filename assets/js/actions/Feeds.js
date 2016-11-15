import * as AppActions from 'actions/App'
import * as LearningActions from 'actions/Learning'
import * as Personalization from 'actions/Personalization'

import { browserHistory } from 'react-router'

export const LOAD = 'FEEDS_LOAD'
export const load = (page = 1, limit = 25, version = null) => dispatch => {

    let v = version || localStorage.getItem('version')

    if (page == 1) {

        v = null

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
        })
            .then(res => {
                localStorage.removeItem('version')
                dispatch(impression(res.response.results.map(item => item.object.id)))
                return Promise.resolve(res)
            })
            .then(res =>
                Promise.resolve().then(() => localStorage.setItem('version', res.response.version))
            ).then(() => dispatch(Personalization.getStats()))

    } else {

        return dispatch({
            type: LOAD,

            data: {
                limit,
                offset: (page - 1) * limit,
            },

            sync: {
                method: 'GET',
                url: '/api/stream/personalized',
            }
        })
        .then(res => {
            dispatch(impression(res.response.results.map(item => item.object.id)))
            return Promise.resolve(res)
        })
        .then(res =>
            Promise.resolve()
                .then(() => localStorage.removeItem('version'))
                .then(() => localStorage.setItem('version', res.response.version))
        ).then(() => dispatch(Personalization.getStats()))

    }

}

export const ADD = 'FEEDS_ADD'
export const add = (data) => dispatch => {

    return dispatch({
        type: ADD,

        data,

        sync: {
            method: 'GET',
            url: '/api/rss/discover',
        }
    }).then(res => {
        dispatch(AppActions.reload())
            .then(() => browserHistory.push(`/app/subscriptions/${res.response.feed_id}`))
    }, err => {
        throw err
    })

}

export const ENGAGE = 'FEEDS_ENGAGE'
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

export const IMPRESSION = 'FEEDS_IMPRESSION'
export const impression = ids => (dispatch, getState) => {

    const user = getState().User

    client.trackImpression({
        content_list: ids.map(id => `articles:${id}`),
        feed_id: `timeline:${user.id}`,
        location: 'popular',
    })

    return dispatch({
        type: IMPRESSION,

        data: {
            id: ids.map(id => id),
        },
    })

}

export const CLEAR = 'FEEDS_CLEAR'
export const clear = () => ({
    type: CLEAR,
})
