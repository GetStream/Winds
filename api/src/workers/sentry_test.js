import "../loadenv"
import { Raven, CaptureError } from "../utils/errors"
import logger from "../utils/logger"

Raven.context(function() {
    Raven.setContext({ url: "google" })
    Raven.captureBreadcrumb({ action: "flashflood" })
    try {
        doSomething(a[0])
    } catch (e) {
        console.log("sending to raven", e)
        Raven.captureException(e)
    }
})

console.log("v1", Raven.version)

import { createSentryTransport } from "../utils/logger/sentry"
var t = createSentryTransport(Raven)
console.log(t)

logger.error("testing sentry 123")
