import * as AppActions from 'actions/App'
import * as TopicActions from 'actions/Topics'

export const ME = 'USER_ME'
export const me = () => dispatch => {

    if (!localStorage.getItem('token'))
        return Promise.reject(new Error('No JWT Token'))

    return dispatch({
        type: ME,

        sync: {
            url: '/api/me',
            method: 'GET',
        },
    }).then(res => {

        client.setUser({ id: res.response.id, alias: res.response.email })

        localStorage.setItem('id', res.response.id)
        localStorage.setItem('email', res.response.email)
        localStorage.setItem('token', res.response.token)
        localStorage.setItem('timeline_token', res.response.feedTokens.timeline)

        return dispatch(AppActions.reload())

    }).then(() => {
        return dispatch(TopicActions.load())
    })

}

export const UPDATE = 'USER_UPDATE'
export const update = data => ({
    type: UPDATE,

    data,

    sync: {
        url: '/api/update_password',
        method: 'POST',
    }
})

export const CREATE = 'USER_CREATE'
export const create = (user) => dispatch => {

    return dispatch({
        type: CREATE,

        data: { ...user },

        sync: {
            method: 'POST',
            url: '/api/register',
        },
    }).then(res => {

        client.setUser({ id: res.response.id, alias: res.response.email })

        localStorage.setItem('id', res.response.id)
        localStorage.setItem('email', res.response.email)
        localStorage.setItem('token', res.response.token)
        localStorage.setItem('timeline_token', res.response.feedTokens.timeline)

        return dispatch(AppActions.reload())

    }).then(() => {
        return dispatch(TopicActions.load())
    }, err => {
        throw err
    })
}

export const LOGIN = 'USER_LOGIN'
export const login = (email, password) => dispatch => {
    return dispatch({
        type: LOGIN,

        data: { email, password, },

        sync: {
            method: 'POST',
            url: '/api/login',
        },
    }).then(res => {

        client.setUser({ id: res.response.id, alias: res.response.email })

        localStorage.setItem('id', res.response.user.id)
        localStorage.setItem('email', res.response.user.email)
        localStorage.setItem('token', res.response.user.token)
        localStorage.setItem('timeline_token', res.response.user.feedTokens.timeline)

        return dispatch(AppActions.reload())

    }).then(() => {
        return dispatch(TopicActions.load())
    }, err => {
        throw err
    })
}

export const UPDATE_PASSWORD = 'USER_UPDATE_PASSWORD'
export const updatePassword = (email, password) => ({
    type: UPDATE_PASSWORD,

    data: { id, password },

    sync: {
        method: 'PUT',
        url: '/api/pasword_update',
    },
})

export const RESET_PASSWORD = 'USER_RESET_PASSWORD'
export const resetPassword = (email) => ({
    type: RESET_PASSWORD,

    data: { email, },

    sync: {
        method: 'POST',
        url: '/api/password_reset',
    },
})

export const LOGOUT = 'USER_LOGOUT'
export const logout = () => ({
    type: LOGOUT,
})
