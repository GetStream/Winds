module.exports = {
	database: {
		uri: 'mongodb://localhost:27017/test',
	},
	cache: {
		uri: 'redis://localhost:6379?db=10',
	},
	analyticsDisabled: true,
};
