import * as ArticleActions from 'actions/Articles'
import * as UserActions from 'actions/User'

function Articles(state = [], action) {

    switch (action.type) {

        case ArticleActions.LOAD:
            if (action.response) {
                return ([...state, ...action.response.results]).filter((item, index, arr) =>
                    arr.map(s => s.object.id).indexOf(item.object.id) == index)
            }
            return state

        case ArticleActions.CLEAR:
            return []
    }

    return state
    
}

export default Articles
