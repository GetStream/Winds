import axios from "axios"

import logger from "../logger"
import config from "../../config"

const parser = data => {
    return new Promise((resolve, reject) => {
        if (!data.url) {
            const err = "Missing URL (data.url)!"
            logger.error(err)
            reject(err)
        }

        axios
            .get("https://mercury.postlight.com/parser", {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": config.mercury.key,
                },
                params: {
                    url: data.url,
                },
            })
            .then(res => {
                resolve(res.data)
            })
            .catch(err => {
                logger.error(err)
                reject(err)
            })
    })
}

export default parser
