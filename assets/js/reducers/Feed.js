import * as SiteActions from 'actions/Sites'
import * as SubscriptionActions from 'actions/Subscriptions'
import * as UserActions from 'actions/User'

function Feed(state = [], action) {

    switch (action.type) {

        case SiteActions.LOAD_ARTICLES:
            if (action.response) return [...state, ...action.response.results]
            return state

        case SubscriptionActions.MARK_READ:
            return state.map(sub => {
                if (action.data.articles.indexOf(sub.object.id) >= 0) {
                    return {...sub, read: true, }
                }
                return sub
            })

        case SiteActions.CLEAR_ARTICLES:
            return []

        default:
            return state
            
    }
}

export default Feed
