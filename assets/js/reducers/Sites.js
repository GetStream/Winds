import * as SiteActions from 'actions/Sites'
import * as UserActions from 'actions/User'

function Sites(state = [], action) {

    switch (action.type) {

        case SiteActions.LOAD:
            if (action.response) return [...action.response]
            return state

        case SiteActions.UNSUBSCRIBE:
            return state.filter(s => s.feed.id != action.data.feed_id)

        default:
            return state

    }
    
}

export default Sites
