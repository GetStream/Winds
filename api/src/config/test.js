module.exports = {
	database: {
		uri: 'mongodb://localhost:27017/test',
	},
	cache: {
		uri: 'redis://localhost:6379/10',
	},
	email: {
		backend: 'dummy',
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
	analyticsDisabled: false,
	url: 'https://winds.gestream.io',
};
