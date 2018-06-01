require('babel-register')({
	presets: [
		[
			'env',
			{
				targets: {
					node: 'current',
				},
			},
		],
	],
	plugins: [
		'shebang', 'transform-async-generator-functions',
	],
});

//XXX: mocking modules before anything else is loaded
const sinon = require('sinon');
const mock = require('mock-require');

mock('getstream', {
	connect: sinon.stub().callsFake(() => {
		return require('./src/utils/test').getMockClient();
	}),
});
mock('./src/utils/events', sinon.spy(sinon.stub().returns(Promise.resolve())));
mock('./src/utils/email', sinon.spy(sinon.stub().returns(Promise.resolve())));

require('./setup-tests');
