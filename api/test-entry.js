require('babel-register')({
	presets: [
		['env', {
			targets: {
				node: 'current'
			}
		}]
	],
	plugins: [
		'shebang',
		'transform-async-generator-functions',
		['istanbul', {
			'exclude': [
				'test',
				'setup-tests.js',
				'test-entry.js',
			]
		}]
	]
});

//XXX: mocking modules before anything else is loaded
const sinon = require('sinon');
const mock = require('mock-require');

mock('getstream', {
	connect: sinon.stub().callsFake(() => {
		return require('./test/utils').getMockClient();
	}),
});
mock('./src/utils/events', sinon.spy(sinon.stub().returns(Promise.resolve())));

require('./setup-tests');
