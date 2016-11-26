var request = require('supertest'),
    assert = require('assert')

describe('Discover', function() {

    it('finds the spacex rss feed', function (done) {
      request(sails.hooks.http.app)
        .get('/api/rss/discover')
        .timeout(10000)
        .query({ url: 'http://spacex.com'})
        .set('Authorization', `JWT ${test.token}`)
        .expect(200, done)
    })

    it('finds the engadget rss feed', function (done) {
      request(sails.hooks.http.app)
        .get('/api/rss/discover')
        .timeout(10000)
        .query({ url: 'http://engadget.com'})
        .set('Authorization', `JWT ${test.token}`)
        .expect(200, done)
    })

    it('fails on the google rss feed', function (done) {
      request(sails.hooks.http.app)
        .get('/api/rss/discover')
        .timeout(10000)
        .query({ url: 'google.com'})
        .set('Authorization', `JWT ${test.token}`)
        .expect(400, function(err, result) {
            assert.ifError(err)
            done()
        })
    })

    it('finds the highscalability rss feed', function (done) {
      request(sails.hooks.http.app)
        .get('/api/rss/discover')
        .timeout(10000)
        .query({ url: 'http://highscalability.com/'})
        .set('Authorization', `JWT ${test.token}`)
        .expect(200, done)
    })

    it('finds the onstartups rss feed', function (done) {
      request(sails.hooks.http.app)
        .get('/api/rss/discover')
        .timeout(10000)
        .query({ url: 'http://onstartups.com/'})
        .set('Authorization', `JWT ${test.token}`)
        .expect(200, done)
    })

    it('finds the gizmododirect rss feed', function (done) {
      request(sails.hooks.http.app)
        .get('/api/rss/discover')
        .timeout(10000)
        .query({ url: 'http://feeds.gawker.com/gizmodo/full'})
        .set('Authorization', `JWT ${test.token}`)
        .expect(200, done)
    })

    it.skip('finds the darkreading rss feed', function (done) {
      request(sails.hooks.http.app)
        .get('/api/rss/discover')
        .timeout(10000)
        .query({ url: 'http://www.darkreading.com/'})
        .set('Authorization', `JWT ${test.token}`)
        .expect(200, done)
    })

    it('finds parses darkreading rss feed direct', function (done) {
      request(sails.hooks.http.app)
        .get('/api/rss/discover')
        .timeout(10000)
        .query({ url: 'http://www.darkreading.com/rss_simple.asp'})
        .set('Authorization', `JWT ${test.token}`)
        .expect(200, done)
    })

    it('finds the security rss feed', function (done) {
      request(sails.hooks.http.app)
        .get('/api/rss/discover')
        .timeout(10000)
        .query({ url: 'https://security.googleblog.com/'})
        .set('Authorization', `JWT ${test.token}`)
        .expect(200, done)
    })

    it('finds the securitydirect rss feed', function (done) {
      request(sails.hooks.http.app)
        .get('/api/rss/discover')
        .timeout(10000)
        .query({ url: 'https://googleonlinesecurity.blogspot.com/atom.xml'})
        .set('Authorization', `JWT ${test.token}`)
        .expect(200, done)
    })

    it('fails to find the yourshot rss feed', function (done) {
      request(sails.hooks.http.app)
        .get('/api/rss/discover')
        .timeout(10000)
        .query({ url: 'yourshot.nationalgeographic.com'})
        .set('Authorization', `JWT ${test.token}`)
        .expect(400, done)
    })

    it.skip('finds the sentry rss feed', function (done) {
      request(sails.hooks.http.app)
        .get('/api/rss/discover')
        .timeout(10000)
        .query({ url: 'https://blog.sentry.io/'})
        .set('Authorization', `JWT ${test.token}`)
        .expect(200, done)
    })

    it('finds the tweakers rss feed direct', function (done) {
      request(sails.hooks.http.app)
        .get('/api/rss/discover')
        .timeout(10000)
        .query({ url: 'http://feeds.feedburner.com/tweakers/mixed'})
        .set('Authorization', `JWT ${test.token}`)
        .expect(200, done)
    })

    it('finds the tweakers rss feed', function (done) {
      request(sails.hooks.http.app)
        .get('/api/rss/discover')
        .timeout(10000)
        .query({ url: 'tweakers.net'})
        .set('Authorization', `JWT ${test.token}`)
        .expect(200, done)
    })

    it('finds the facebook developer rss feed', function (done) {
      request(sails.hooks.http.app)
        .get('/api/rss/discover')
        .timeout(10000)
        .query({ url: 'https://code.facebook.com/posts/rss'})
        .set('Authorization', `JWT ${test.token}`)
        .expect(200, done)
    })

    it('finds the firstround rss feed', function (done) {
      request(sails.hooks.http.app)
        .get('/api/rss/discover')
        .timeout(10000)
        .query({ url: 'http://firstround.com/review/feed.xml'})
        .set('Authorization', `JWT ${test.token}`)
        .expect(200, function(err, result) {
            console.log(result.body)
            done()
        })
    })

    it('doesnt find the cnet.com rss feed', function (done) {
      request(sails.hooks.http.app)
        .get('/api/rss/discover')
        .timeout(10000)
        .query({ url: 'cnet.com'})
        .set('Authorization', `JWT ${test.token}`)
        .expect(400, function(err, result) {
            console.log(result.body)
            done()
        })
    })

    it('doesnt find the michaelmoore rss feed', function (done) {
      request(sails.hooks.http.app)
        .get('/api/rss/discover')
        .timeout(10000)
        .query({ url: 'http://michaelmoore.com/'})
        .set('Authorization', `JWT ${test.token}`)
        .expect(400, function(err, result) {
            console.log(result.body)
            done()
        })
    })

    it('finds the coreos rss feed', function (done) {
      request(sails.hooks.http.app)
        .get('/api/rss/discover')
        .timeout(10000)
        .query({ url: 'https://coreos.com/atom.xml'})
        .set('Authorization', `JWT ${test.token}`)
        .expect(200, function(err, result) {
            console.log(result.body)
            done()
        })
    })

    it('finds the nodejs rss feed', function (done) {
      request(sails.hooks.http.app)
        .get('/api/rss/discover')
        .timeout(10000)
        .query({ url: 'http://blog.nodejs.org/feed/'})
        .set('Authorization', `JWT ${test.token}`)
        .expect(200, function(err, result) {
            console.log(result.body)
            done()
        })
    })

    it.skip('finds the reddit rss programming', function (done) {
      request(sails.hooks.http.app)
        .get('/api/rss/discover')
        .timeout(10000)
        .query({ url: 'https://www.reddit.com/r/programming/'})
        .set('Authorization', `JWT ${test.token}`)
        .expect(200, done)
    })

})
