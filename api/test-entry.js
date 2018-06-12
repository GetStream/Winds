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
const util = require('util');
const sinon = require('sinon');
const mock = require('mock-require');

function spyOnEverything(module) {
	const spiedOn = {};
	const proto = require(module);
	for (const key in proto) {
		if (!proto.hasOwnProperty(key)) {
			continue;
		}
		const prop = proto[key];
		spiedOn[key] = util.isFunction(prop) ? sinon.spy(prop) : prop;
	}
	return spiedOn;
}

mock('getstream', {
	connect: sinon.stub().callsFake(() => {
		return require('./test/utils').getMockClient();
	}),
});
mock('./src/utils/events', sinon.spy(sinon.stub().returns(Promise.resolve())));
mock('./src/parsers/feed', spyOnEverything('./src/parsers/feed'));
mock('./src/asyncTasks', spyOnEverything('./src/asyncTasks'));

require('./setup-tests');
