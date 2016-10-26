import * as Personalization from 'actions/Personalization'
import * as UserActions from 'actions/User'

const initialState = {
    click: 0,
    impression: 0,
}

function Stats(state = initialState, action) {

    switch (action.type) {

        case Personalization.GET_STATS:
            if (action.response) {
                return {...state, ...action.response.results }
            }
            return state

        default:
            return state
            
    }

}

export default Stats
