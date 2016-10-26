import * as Articles from 'actions/Articles'
import * as Subscriptions from 'actions/Subscriptions'
import * as Feeds from 'actions/Feeds'
import * as Topics from 'actions/Topics'
import * as User from 'actions/User'
import * as Learning from 'actions/Learning'
import * as Sites from 'actions/Sites'
import * as Personalization from 'actions/Personalization'

export const LOADED = 'APP_LOADED'
export const loaded = () => ({
    type: LOADED,
})

export const INIT = 'APP_INIT'
export const init = () => dispatch => dispatch(Topics.load())
        .then(() =>
            dispatch(User.me())
                .then(userRes => Promise.all([
                        dispatch(Feeds.load()),
                        dispatch(Articles.load()),
                        dispatch(Subscriptions.load()),
                        dispatch(Sites.load()),
                        dispatch(Personalization.getStats()),
                    ]).then(data => Promise.resolve([...data])), err => {
                        return Promise.reject(err)
                    })
        ).catch(err => Promise.reject(err))

export const reload = () => dispatch => {
    return Promise.all([
        dispatch(Feeds.load()),
        dispatch(Articles.load()),
        dispatch(Subscriptions.load()),
        dispatch(Sites.load()),
        dispatch(Personalization.getStats()),
    ]).then(() => dispatch(
        loaded()
    )).catch(err => Promise.reject(err))
}
