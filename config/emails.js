module.exports = {
    emails: {
        backend: 'sendgrid',
        username: process.env.SENDGRID_USERNAME,
        password: process.env.SENDGRID_PASSWORD
    }
}
