import * as SubscriptionActions from 'actions/Subscriptions'
import * as UserActions from 'actions/User'

function Subscriptions(state = [], action) {

    switch (action.type) {
        case SubscriptionActions.LOAD:
            if (action.response) {
                return ([...state, ...action.response.results]).filter((item, index, arr) =>
                    arr.map(s => s.id).indexOf(item.id) == index)
            }
            return state

        case SubscriptionActions.CLEAR:
            return []

        case SubscriptionActions.MARK_READ:
            return state.map(sub => {
                if (action.data.articles.indexOf(sub.object.id) >= 0) {
                    return {...sub, read: true, }
                }
                return sub
            })

    }

    return state
}

export default Subscriptions
