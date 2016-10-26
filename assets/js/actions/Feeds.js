import * as AppActions from 'actions/App'

import { browserHistory } from 'react-router'

export const LOAD = 'FEEDS_LOAD'
export const load = (limit = 20, ) => ({
    type: LOAD,

    data: {
        limit,
    },

    sync: {
        method: 'GET',
        url: '/api/stream/personalized',
    }
})

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
        browserHistory.replace(`/app/subscriptions/${res.response.feed_id}`)
        return dispatch(AppActions.reload())
    }, err => {
        alert('Sorry, we could not fetch the provided RSS feed. Please try a different URL.')
        document.getElementsByClassName('url')[0].value = ''
        document.getElementsByClassName('url')[0].focus()
        throw err
    })

}
