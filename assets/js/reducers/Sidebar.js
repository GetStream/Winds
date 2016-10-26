import * as SidebarActions from 'actions/Sidebar'
import * as UserActions from 'actions/User'

function Sidebar(state = false, action) {

    switch (action.type) {
        
        case SidebarActions.OPEN:
            return true

        case SidebarActions.CLOSE:
            return false

        case UserActions.LOGIN:
            return false

    }

    return state
}

export default Sidebar
