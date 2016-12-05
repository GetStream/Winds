import * as FeedActions from 'actions/Feeds'
import * as UserActions from 'actions/User'

function Feeds(state = [], action) {

    switch (action.type) {

        case FeedActions.LOAD:
            if (action.response) {
                return ([...state, ...action.response.results]).filter((item, index, arr) =>
                    arr.map(s => s.object.id).indexOf(item.object.id) == index)
            }
            return state

        case UserActions.LOGOUT:
        case FeedActions.CLEAR:
            return []

    }

    return state

}

export default Feeds
