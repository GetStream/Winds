require('babel-register')({
    "presets": [
        [
            "env",
            {
                "targets": {
                    "node": "current"
                },
            }
        ]
    ],
    "plugins": [
        "shebang", "transform-async-generator-functions"
    ]
});

const sinon = require('sinon');
const mock = require('mock-require');

mock('getstream', {
    connect: sinon.stub().callsFake(() => {
        return require('./src/utils/test').getMockClient();
    })
});
mock('./src/utils/events', sinon.stub().returns(Promise.resolve()));

require('./setup-tests');
