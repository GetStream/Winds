import * as AppActions from 'actions/App'

const initialState = {
    loading: true,
}

function App(state = initialState, action) {

    switch (action.type) {

        case AppActions.LOADED:
            return { loading: false, }

        default:
            return state
            
    }

}

export default App
