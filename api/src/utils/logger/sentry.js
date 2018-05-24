import Raven from "raven"
import Transport from "winston-transport"
const util = require("util")

const winstonLevelToSentryLevel = {
    silly: "debug",
    verbose: "debug",
    info: "info",
    debug: "debug",
    warn: "warning",
    error: "error",
}

/**
 * @param {Error} error
 */
const errorHandler = error => {
    console.log(error)
}

/**
 * @param {{}} info
 * @param {string} info.level
 * @return {{}}
 */
const prepareMeta = info => {
    let extra = Object.assign({}, info)
    delete extra.message
    delete extra.level
    delete extra.tags

    let error = info.message instanceof Error ? info.message : new Error(info.message)
    extra.stackError = error.stack

    return {
        level: winstonLevelToSentryLevel[info.level],
        tags: info.tags || {},
        extra,
    }
}

class SentryWinstonTransport extends Transport {
    constructor(options) {
        super(options)

        this.options = Object.assign(
            {
                dsn: "",
                patchGlobal: false,
                install: false,
                tags: {},
                extra: {},
                errorHandler,
            },
            options,
        )
    }

    /**
     * @param {{}} info
     * @param {string} info.level
     * @param {Error|string} info.message
     * @param {Function} done
     */
    async log(info, done) {
        if (this.silent) return done(null, true)
        let meta = prepareMeta(info)

        let method = info.message === "error" ? "captureException" : "captureMessage"

        try {
            let eventId = await this.raven[method](info.message, meta)
            done(null, eventId)
        } catch (error) {
            done(error)
        }
    }
}
SentryWinstonTransport.prototype.name = "sentry"

function createSentryTransport(ravenInstance) {
    let transport = new SentryWinstonTransport({ level: "error" })
    transport.raven = ravenInstance
    return transport
}

module.exports.createSentryTransport = createSentryTransport
