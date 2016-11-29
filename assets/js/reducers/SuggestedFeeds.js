import * as SuggestedFeedsActions from 'actions/SuggestedFeeds'

function SuggestedFeeds(state = [], action) {
    switch (action.type) {
        case SuggestedFeedsActions.LOAD:
            if (action.response) return [...action.response]
            return state
    }

    return state
}

export default SuggestedFeeds
