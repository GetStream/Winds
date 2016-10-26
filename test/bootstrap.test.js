let sails = require('sails'),
    request = require('supertest'),
    path = require('path'),
    fs = require('fs')


function isLocalConnection(connection) {
    let local = false
    if (connection.adapter == 'sails-disk') {
        local = true
    } else if (connection.adapter == 'sails-memory') {
        local = true
    }
    return local
}

before(function(done) {
  // Increase the Mocha timeout so that Sails has enough time to lift.
  sails.lift({
      hooks: { grunt: false },
      log: { level: 'warn' }
  }, function(err, server) {
    if (err) return done(err);

    // Verify we are running on the local database
    let connectionName = sails.config.models.connection
        connection = sails.config.connections[connectionName]
    sails.log.info('test is running against connection', connection)
    if (false && !isLocalConnection(connection)) {
        let err = 'you cant run test suite against the production db'
        sails.log.error(err, connection)
        return done(err)
    }

    // Trash the database
    let dbPath = path.join(__dirname, '../', '.tmp', 'localTestDiskDb.db')
    let nodeEnv = process.env['NODE_ENV']
    sails.log.info('removing local test db with path', dbPath)
    try{
        if (isLocalConnection(connection)) {
            fs.unlinkSync(dbPath)
        }
    } catch(e) {
        sails.log.warn('failed to delete test db', e)
    }

    // Setup a user account for testing
    let password = '123456abc',
        email = 'thierry+133334aa@getstream.io'
    sails.test = {}
    request(sails.hooks.http.app)
      .post('/api/register')
      .send({'email': email, 'password': password})
      .expect(200, function(err, result) {
          if (err) {
              console.log('bootstrap register failed with error', err, result.body)
          }
          sails.test.token = result.body.token
          done(err, sails);
      })
  });
});

after(function(done) {
  // here you can clear fixtures, etc.
  sails.lower(done);
});
