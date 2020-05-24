module.exports = {
	apps: [
		{
			name: 'api',
			interpreter: 'babel-node',
			script: 'src/server.js',
			watch: true,
			ignore_watch: ['.git', 'node_modules'],
		},
		{
			name: 'conductor',
			interpreter: 'babel-node',
			script: 'src/workers/conductor.js',
			watch: true,
			ignore_watch: ['.git', 'node_modules'],
		},
		{
			name: 'stream',
			interpreter: 'babel-node',
			script: 'src/workers/stream.js',
			watch: true,
			ignore_watch: ['.git', 'node_modules'],
		},
		{
			name: 'rss',
			interpreter: 'babel-node',
			script: 'src/workers/rss.js',
			watch: true,
			ignore_watch: ['.git', 'node_modules'],
		},
		{
			name: 'podcast',
			interpreter: 'babel-node',
			script: 'src/workers/podcast.js',
			watch: true,
			ignore_watch: ['.git', 'node_modules'],
		},
		{
			name: 'og',
			interpreter: 'babel-node',
			script: 'src/workers/og.js',
			watch: true,
			ignore_watch: ['.git', 'node_modules'],
		},
	],
};
