import * as PersonalizationActions from 'actions/Personalization'
import * as UserActions from 'actions/User'

const lsState = localStorage.getItem('personalizationClosed')

const initialState = {
    open:  lsState !== null ? false : true,
}

function Personalization(state = initialState, action) {

    switch (action.type) {

        case PersonalizationActions.OPEN:
            return { open: true, }

        case PersonalizationActions.CLOSE:
            return { open: false, }

        case PersonalizationActions.TOGGLE:
            return { open: !state.open, }

        default:
            return state
    }
    
}

export default Personalization
