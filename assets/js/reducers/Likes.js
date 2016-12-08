import * as LikeActions from 'actions/Likes'

function Likes(state = [], action) {

    switch (action.type) {

        case LikeActions.LOAD:
            if (action.response) return Object.assign({}, action.response)
            return state

        case LikeActions.LIKE:
            if (action.response) return [...action.response]
            return state

        case LikeActions.UNLIKE:
            if (action.response) return [...action.response]
            return state

    }

    return state

}

export default Likes
