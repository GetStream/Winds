import "../../loadenv"

import algolia from "algoliasearch"

import logger from "../logger"
import config from "../../config"

const search = data => {
    if (!data.type) {
        return new Promise(reject => {
            const err = "Missing data.type key and value."
            logger.error(new Error(err))
            reject(err)
        })
    }

    const client = algolia(config.algolia.appId, config.algolia.writeKey)
    const index = client.initIndex(config.algolia.index)

    return new Promise((resolve, reject) => {
        index.addObject(data, (err, res) => {
            if (err) {
                logger.error(err)
                reject(err)
            }
            resolve(res)
        })
    })
}

export default search
