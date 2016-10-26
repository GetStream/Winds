import * as UserActions from 'actions/User'

function User(state = {}, action) {

    switch (action.type) {

        case UserActions.ME:
        case UserActions.CREATE:
            if (action.response) return { ...action.response, loading: false }
            return {...state, loading: true}

        case UserActions.LOGIN:
            if (action.response) return {...action.response.user, loading: false, }
            return {...state, loading: true, }

        default:
            return state

    }

}

export default User
