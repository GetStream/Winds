module.exports = {
	url: 'https://winds.getstream.io',
	logger: { level: process.env.LOGGER_LEVEL || 'info' },
	email: {
		backend: 'not-sendgrid',
		sender: { support: { email: 'not.a.real.email@getstream.io' } },
	},
};
