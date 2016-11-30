import * as SuggestedFeedsActions from 'actions/SuggestedFeeds'

function SuggestedFeeds(state = [], action) {
    switch (action.type) {
        case SuggestedFeedsActions.LOAD:
            if (action.response) return [...action.response]
            return state
        case SuggestedFeedsActions.FOLLOW:
        case SuggestedFeedsActions.REMOVE:
            if (action.data) return state.filter(suggestion => suggestion.id !== action.data.feed_id)
            return state
    }

    return state
}

export default SuggestedFeeds
