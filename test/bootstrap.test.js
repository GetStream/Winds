let sails   = require('sails'),
    request = require('supertest'),
    Chance  = require('chance'),
    chance  = new Chance(),
    path    = require('path'),
    env     = require('dotenv'),
    fs      = require('fs')

//require('dotenv').config()


var argv = require('yargs')
    .alias('v', 'verbosity')
    .string('v')
    .describe('v', 'set the verbosity level')
    .default('v', 'warn')

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

  sails.lift({
      hooks: {
          "grunt": false,
          "sockets": false,
          "pubsub": false
      },
      log: { level: 'warn' }
  }, function(err, server) {

    if (err) return done(err)

    let connectionName = sails.config.models.connection,
        connection     = sails.config.connections[connectionName]

    sails.log.info('Test is running against connection', connection)

    if (false && !isLocalConnection(connection)) {
        let err = 'You cant run test suite against the production database'
        sails.log.error(err, connection)
        return done(err)
    }

    let dbPath  = path.join(__dirname, '../', '.tmp', 'localTestDiskDb.db'),
        nodeEnv = process.env.NODE_ENV

    sails.log.info('Removing local test database with path', dbPath)

    try {
        if (isLocalConnection(connection)) {
            fs.unlinkSync(dbPath)
        }
    } catch(e) {
        sails.log.warn('Failed to delete local test database because it does not exist')
    }

    let email    = chance.email(),
        password = chance.string({ length: 6 })

    global.test = {}

    request(sails.hooks.http.app)
      .post('/api/register')
      .send({'email': email, 'password': password})
      .expect(200, function(err, result) {

          if (err) {
            return sails.log.warn('Bootstrap registration failed with error:', result.body)
          }

          sails.log.info('Registered an account, providing token now', result.body.token)

          test.token    = result.body.token
          test.email    = email
          test.password = password

          done(err, sails)

      })
  })

})

after(function(done) {
  sails.lower(done)
})
