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
		'shebang',
		'transform-async-generator-functions',
		[
			'istanbul',
			{
				exclude: ['test', 'setup-tests.js', 'test-entry.js'],
			},
		],
	],
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
		if (util.isFunction(prop)) {
			spiedOn[key] = sinon.spy(function() {
				return spiedOn[key]._fn.apply(this, arguments);
			});
			spiedOn[key]._fn = prop;
		} else {
			spiedOn[key] = prop;
		}
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
mock('./src/parsers/og', spyOnEverything('./src/parsers/og'));
mock('./src/asyncTasks', spyOnEverything('./src/asyncTasks'));

require('./setup-tests');
