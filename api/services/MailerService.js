var MailerService = require('sails-service-mailer')

sails.log.info(`configuring mail service to use ${sails.config.emails.backend} backend`)
const SendGrid = MailerService(sails.config.emails.backend, {
    from: 'Josh <josh@getstream.io>',
    provider: {
        auth: {
            api_user: sails.config.emails.username,
            api_key: sails.config.emails.password,
        }
    }
});

module.exports = SendGrid
