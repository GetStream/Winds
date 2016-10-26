import * as TopicActions from 'actions/Topics'
import * as UserActions from 'actions/User'

function Topics(state = [], action) {

    switch (action.type) {

        case TopicActions.LOAD:
            if (action.response) return [...action.response]
            return state

        case TopicActions.FOLLOW:
            return state.map(t => {
                if (t.id == action.data.follow[0]) {
                    return {...t, followed: true}
                }
                return t
            })

        case TopicActions.UNFOLLOW:
            return state.map(t => {
                if (t.id == action.data.unfollow[0]) {
                    return {...t, followed: false}
                }
                return t
            })

    }

    return state
}

export default Topics
