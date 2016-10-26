import * as LearningActions from 'actions/Learning'
import * as UserActions from 'actions/User'

function Learning(state = [], action) {

    switch (action.type) {

        case LearningActions.LOAD:
            if (action.response) return [...action.response.results]
            return []

        default:
            return state

    }
    
}

export default Learning
