import * as AppActions from 'actions/App'

export const ME = 'USER_ME'
export const me = () => dispatch => {

    if (!localStorage.getItem('token')) return Promise.reject(new Error('No JWT Token'))

    return dispatch({
        type: ME,

        sync: {
            url: '/api/me',
            method: 'GET',
        },
    }).then(res => {

        localStorage.setItem('id', res.response.id)
        localStorage.setItem('email', res.response.email)
        localStorage.setItem('token', res.response.token)

        client.setUser({ id: res.response.id, alias: res.response.email })

        return dispatch(AppActions.reload())

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

        localStorage.setItem('id', res.response.id)
        localStorage.setItem('email', res.response.email)
        localStorage.setItem('token', res.response.token)

        client.setUser({ id: res.response.id, alias: res.response.email })

        dispatch(AppActions.reload())

    }, err => {
        alert('Email already exists. Please login with your existing email and password or new credentials.')
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

        localStorage.setItem('id', res.response.user.id)
        localStorage.setItem('email', res.response.user.email)
        localStorage.setItem('token', res.response.user.token)

        client.setUser({ id: res.response.user.id, alias: res.response.user.email })

        dispatch(AppActions.reload())

    }, err => {
        throw err
    })
}

export const UPDATE_PASSWORD = 'USER_UPDATE_PASSWORD'
export const updatePassword = (email, password) => dispatch => {

    return dispatch({
        type: UPDATE_PASSWORD,

        data: { id, password },

        sync: {
            method: 'PUT',
            url: '/api/pasword_update',
        },
    }).then(res => {
        alert('Your password has been successfully updated.')
    }, err => {
        alert('Sorry, an unknown error has occurred. Please try again at a later time.')
        throw err
    })

}

export const RESET_PASSWORD = 'USER_RESET_PASSWORD'
export const resetPassword = (email) => dispatch => {

    return dispatch({
        type: RESET_PASSWORD,

        data: { email, },

        sync: {
            method: 'POST',
            url: '/api/password_reset',
        },
    }).then(res => {
        alert('Your password has been successfully reset. Please check your email.')
    }, err => {
        alert('Sorry, an unknown error has occurred. Please try again at a later time.')
        throw err
    })

}

export const LOGOUT = 'USER_LOGOUT'
export const logout = () => ({
    type: LOGOUT,
})
