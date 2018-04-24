export default {
	env: process.env.NODE_ENV || 'development',
	port: process.env.PORT || 8000,
	algolia: {
		index: process.env.REACT_APP_ALGOLIA_INDEX,
		appId: process.env.REACT_APP_ALGOLIA_APP_ID,
		searchKey: process.env.REACT_APP_ALGOLIA_SEARCH_KEY,
	},
	api: {
		url: process.env.REACT_APP_API_ENDPOINT,
	},
	google: {
		analytics: process.env.REACT_APP_GOOGLE_ANALYTICS,
	},
	stream: {
		appID: process.env.REACT_APP_STREAM_APP_ID,
	},
};
