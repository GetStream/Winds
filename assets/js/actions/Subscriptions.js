import * as PersonalizationActions from 'actions/Personalization'

export const LOAD = 'SUBSCRIPTIONS_LOAD'
export const load = (id_lt = null, limit = 25, sort = 'createdAt DESC') => dispatch => {
    return dispatch({
        type: LOAD,

        data: {
            limit,
            id_lt,
            sort,
        },

        sync: {
            method: 'GET',
            url: '/api/stream/chronological',
        }
    }).then(res => {
        dispatch(impression(res.response.results.map(r => r.object.id)))
        return Promise.resolve(res)
    }).then(() => dispatch(PersonalizationActions.getStats()))
}

export const CLEAR = 'SUBSCRIPTIONS_CLEAR'
export const clear = () => ({
    type: CLEAR,
})

export const MARK_READ = 'SUBSCRIPTIONS_MARK_READ'
export const markRead = ids => (dispatch, getState) => {

    if (!ids) ids = getState().Subscriptions.map(sub => sub.object.id)

    return dispatch({
        type: MARK_READ,

        data: { articles: ids, },

        sync: {
            url: '/api/mark_read',
            method: 'post',
        }
    })

}

export const ENGAGE = 'SUBSCRIPTION_ENGAGE'
export const engage = (id, index) => dispatch => {

    client.trackEngagement({
        label: 'click',
        content: {
            foreign_id: `articles:${id}`
        },
        position: index,
        location: 'subscriptions',
    })

    return dispatch({
        type: ENGAGE,

        data: { id, index, },
    }).then(() => dispatch(markRead([id])))

}

export const IMPRESSION = 'SUBSCRIPTION_IMPRESSION'
export const impression = ids => (dispatch, getState) => {

    const userID = getState().User.id

    client.trackImpression({
        content_list: ids.map(id => `articles:${id}`),
        feed_id: `timeline:${userID}`,
        location: 'subscriptions',
    })

    return dispatch({
        type: IMPRESSION,
        data: { id: ids.map(id => id), userID, }
    })

}
