import axios from "axios"
import jwt from "jsonwebtoken"

import config from "../../config"

const personalization = data => {
    return new Promise((resolve, reject) => {
        const token = jwt.sign(
            {
                action: "*",
                feed_id: "*",
                resource: "*",
                user_id: "*",
            },
            config.stream.apiSecret,
            { algorithm: "HS256", noTimestamp: true },
        )

        return axios({
            baseURL: config.stream.baseUrl,
            headers: {
                Authorization: token,
                "Content-Type": "application/json",
                "Stream-Auth-Type": "jwt",
            },
            method: "GET",
            params: {
                api_key: config.stream.apiKey,
                user_id: data.userId,
            },
            url: data.endpoint,
        })
            .then(res => {
                const data = res.data.results.map(result => {
                    return result.foreign_id.split(":")[1]
                })
                resolve(data)
            })
            .catch(err => {
                reject(err)
            })
    })
}

export default personalization
