import * as OPMLDialogActions from 'actions/OPMLDialog'

function ImportOPMLDialog(state = false, action) {

    switch (action.type) {

        case OPMLDialogActions.OPEN:
            return true

        case OPMLDialogActions.CLOSE:
            return false

    }

    return state

}

export default ImportOPMLDialog
