var MailerService = require('sails-service-mailer')

sails.log.info(`configuring mail service to use ${sails.config.emails.backend} backend`)
const SendGrid = MailerService(sails.config.emails.backend, {
    from: sails.config.emails.from,
    provider: sails.config.emails.provider
});
module.exports = SendGrid
