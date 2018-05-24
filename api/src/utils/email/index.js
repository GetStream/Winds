import fs from "fs"
import ejs from "ejs"
import sendgrid from "@sendgrid/mail"

import logger from "../logger"
import config from "../../config"

const email = data => {
    if (!data.type || !data.email) {
        return new Promise(reject => {
            const err = "Missing data.type OR data.email!"
            logger.error(err)
            reject(err)
        })
    }

    return new Promise((resolve, reject) => {
        if (config.env !== "production") {
            return resolve()
        }

        sendgrid.setApiKey(config.email.sendgrid.secret)
        const type = data.type.toLowerCase()

        if (data.type === "welcome") {
            const msg = ejs.render(fs.readFileSync(__dirname + "/templates/welcome.ejs", "utf8"))

            const obj = {
                to: data.email,
                from: {
                    name: config.email.sender.default.name,
                    email: config.email.sender.default.email,
                },
                subject: "Welcome to Winds!",
                content: [
                    {
                        type: "text/html",
                        value: msg,
                    },
                ],
            }

            sendgrid
                .send(obj)
                .then(res => {
                    resolve(res)
                })
                .catch(err => {
                    logger.error(err)
                    reject(err)
                })
        }

        if (data.type === "password") {
            if (!data.passcode) {
                return new Promise(reject => {
                    const err = "Missing data.passcode!"
                    logger.error(err)
                    reject(err)
                })
            }

            const msg = ejs.render(fs.readFileSync(__dirname + "/templates/password.ejs", "utf8"), {
                passcode: data.passcode,
            })

            const obj = {
                to: data.email,
                from: {
                    name: config.email.sender.support.name,
                    email: config.email.sender.support.email,
                },
                subject: "Forgot Password",
                content: [
                    {
                        type: "text/html",
                        value: msg,
                    },
                ],
            }

            sendgrid
                .send(obj)
                .then(res => {
                    resolve(res)
                })
                .catch(err => {
                    logger.error(err)
                    reject(err)
                })
        }

        if (data.type === "followee") {
            if (!data.follower) {
                return new Promise(reject => {
                    const err = "Missing data.follower!"
                    logger.error(err)
                    reject(err)
                })
            }

            const msg = ejs.render(fs.readFileSync(__dirname + "/templates/followee.ejs", "utf8"), {
                follower: data.follower,
                followerId: data.followerId,
            })

            const obj = {
                to: data.email,
                from: {
                    name: config.email.sender.support.name,
                    email: config.email.sender.support.email,
                },
                subject: `You're so popular! ${data.follower} is now following you!`,
                content: [
                    {
                        type: "text/html",
                        value: msg,
                    },
                ],
            }

            sendgrid
                .send(obj)
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

export default email
