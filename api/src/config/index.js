module.exports = {
    env: process.env.NODE_ENV || "development",
    product: {
        url: process.env.PRODUCT_URL,
        name: process.env.PRODUCT_NAME,
        author: process.env.PRODUCT_AUTHOR,
    },
    server: {
        port: process.env.API_PORT,
    },
    jwt: {
        secret: process.env.JWT_SECRET,
    },
    database: {
        uri: process.env.DATABASE_URI,
    },
    cache: {
        uri: process.env.CACHE_URI,
    },
    mercury: {
        key: process.env.MERCURY_KEY,
    },
    algolia: {
        appId: process.env.REACT_APP_ALGOLIA_APP_ID,
        writeKey: process.env.ALGOLIA_WRITE_KEY,
        index: process.env.ALGOLIA_INDEX,
    },
    logger: {
        host: process.env.LOGGER_HOST,
        port: process.env.LOGGER_PORT,
    },
    sentry: {
        dsn: process.env.SENTRY_DSN,
    },
    email: {
        sender: {
            default: {
                name: process.env.EMAIL_SENDER_DEFAULT_NAME,
                email: process.env.EMAIL_SENDER_DEFAULT_EMAIL,
            },
            support: {
                name: process.env.EMAIL_SENDER_SUPPORT_NAME,
                email: process.env.EMAIL_SENDER_SUPPORT_EMAIL,
            },
        },
        sendgrid: {
            secret: process.env.EMAIL_SENDGRID_SECRET,
        },
    },
    stream: {
        appId: process.env.STREAM_APP_ID,
        apiKey: process.env.STREAM_API_KEY,
        apiSecret: process.env.STREAM_API_SECRET,
        baseUrl: process.env.STREAM_API_BASE_URL,
    },
    analyticsDisabled: process.env.ANALYTICS_DISABLED || false,
    statsd: {
        host: process.env.STATSD_HOST || "localhost",
        port: process.env.STATSD_PORT || 8125,
        prefix: process.env.STATSD_PREFIX || "",
    },
}
