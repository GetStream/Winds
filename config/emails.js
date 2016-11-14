module.exports = {
    emails: {
        backend: 'sendgrid',
        from: 'Josh <josh@getstream.io>',
        // docs: https://github.com/ghaiklor/sails-service-mailer
        provider: {
            auth: {
                api_user: process.env.SENDGRID_USERNAME,
                api_key: process.env.SENDGRID_PASSWORD
            }
        }
    }
}
