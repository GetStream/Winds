import axios from "axios"
import jwt from "jsonwebtoken"
import Analytics from "stream-analytics"

import logger from "../logger"
import config from "../../config"

const token = jwt.sign(
    {
        action: "*",
        resource: "*",
        user_id: "*",
    },
    config.stream.apiSecret,
    { algorithm: "HS256", noTimestamp: true },
)

const events = data => {
    return new Promise((resolve, reject) => {
        if (data.engagement || data.impression) {
            const analytics = new Analytics({
                apiKey: config.stream.apiKey,
                token: token,
            })

            analytics.setUser({
                alias: data.email,
                id: data.user,
            })

            if (data.engagement && !config.analyticsDisabled) {
                analytics.trackEngagement(data.engagement)
            }

            if (data.impression && !config.analyticsDisabled) {
                analytics.trackImpression(data.impression)
            }

            resolve()
        }

        if (data.meta && !config.analyticsDisabled) {
            axios({
                data: data.meta,
                headers: {
                    Authorization: token,
                    "stream-auth-type": "jwt",
                },
                method: "POST",
                params: {
                    api_key: config.stream.apiKey,
                },
                url: `${config.stream.baseUrl}/winds_meta/`,
            })
                .then(res => {
                    resolve(res)
                })
                .catch(err => {
                    logger.error(err)
                    reject(err)
                })
        }
    })
}

export default events
