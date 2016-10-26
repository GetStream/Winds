import * as FeedActions from 'actions/Feeds'
import * as UserActions from 'actions/User'

function Feeds(state = [], action) {

    switch (action.type) {

        case FeedActions.LOAD:
            if (action.response) return [...action.response ]
            return state

        case FeedActions.ADD:
            if (action.response) return [...state, action.response]
            return {...state }

    }

    return state
    
}

export default Feeds
