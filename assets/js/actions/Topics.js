import * as AppActions from 'actions/App'
import * as LearningActions from 'actions/Learning'

export const LOAD = 'TOPICS_LOAD'
export const load = (limit = 10, sort = 'createdAt DESC') => ({
    type: LOAD,

    data: {
        limit,
        sort,
    },

    sync: {
        method: 'GET',
        url: '/api/topics',
    }
})

export const FOLLOW = 'TOPICS_FOLLOW'
export const follow = topics => dispatch => {
    return dispatch({
        type: FOLLOW,

        data: {
            follow: [...topics],
        },

        sync: {
            method: 'POST',
            url: '/api/follow_topics',
        },
    }).then(res => {
        return dispatch(AppActions.reload())
    })
}

export const UNFOLLOW = 'TOPICS_UNFOLLOW'
export const unfollow = topics => dispatch => {
    return dispatch({
        type: UNFOLLOW,

        data: {
            unfollow: [...topics],
        },

        sync: {
            method: 'POST',
            url: '/api/follow_topics',
        },
    }).then(res => {
        return dispatch(AppActions.reload())
    })
}
