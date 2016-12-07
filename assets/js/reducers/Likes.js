import * as LikeActions from 'actions/Likes'

function Likes(state = [], action) {

    switch (action.type) {

        case LikeActions.LOAD:
            if (action.response) return [...action.response]
            return state

        case LikeActions.LIKE:
            return state.map(t => {
                if (l.id == action.data.like[0]) {
                    return {...l, liked: true }
                }
                return l
            })

        case LikeActions.UNLIKE:
            return state.map(l => {
                if (l.id == action.data.unlike[0]) {
                    return {...l, liked: false }
                }
                return l
            })

    }

    return state

}

export default Likes
