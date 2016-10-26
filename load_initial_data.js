var Sails      = require('sails').Sails,
    app        = Sails(),
    argv       = require('yargs').argv,
    striptags  = require('striptags'),
    moment     = require('moment'),
    urlLibrary = require('url'),
    async      = require('async');

var initialData = {
    'Design': [
        {'name': 'Designer News', 'rss': 'https://www.designernews.co/?format=rss'},
        {'name': 'Dribbble', 'rss': 'https://dribbble.com/shots/popular.rss'},
        {'name': 'A List Apart', 'rss': 'http://alistapart.com/main/feed'},
        {'name': 'Smashing Magazine', 'rss': 'https://www.smashingmagazine.com/feed/'},
        {'name': 'Invision', 'rss': 'http://blog.invisionapp.com/feed/'}
    ],
    'Startups': [
        {'name': 'On Startups', 'rss': 'http://onstartups.com/rss.xml'},
        {'name': 'Techcrunch', 'rss': 'https://techcrunch.com/feed/'},
        {'name': 'Mashable', 'rss': 'http://feeds.mashable.com/Mashable', 'url': 'http://mashable.com/'}
    ],
    'Programming': [
        {'name': 'Hacker News', 'rss': 'https://news.ycombinator.com/rss'},
        {'name': 'Lobsters', 'rss': 'https://lobste.rs/rss'},
        {'name': 'Sentry', 'rss': 'https://blog.sentry.io/feed.xml'},
        {'name': 'Stream', 'rss': 'http://blog.getstream.io/feed/'}
    ],
    'Gaming': [
        {'name': 'IGN', 'rss': 'http://feeds.ign.com/ign/all', 'url': 'http://ign.com/'},
        {'name': 'Gamespot', 'rss': 'http://www.gamespot.com/feeds/reviews/'},
        {'name': 'Kotaku', 'rss': 'http://feeds.gawker.com/kotaku/full', 'url': 'http://kotaku.com/'}
    ],
    'LifeHacks': [
        {'name': 'Life Hacker', 'rss': 'http://feeds.gawker.com/lifehacker/full', 'url': 'http://lifehacker.com/'},
        {'name': 'Ted Talks', 'rss': 'https://www.ted.com/talks/rss'}
    ],
    'Venture Capital': [
        {'name': 'Mattermark Daily', 'rss': 'https://mattermark.com/category/mattermark-daily/feed/'},
        {'name': 'Brad Feld', 'rss': 'http://feeds.feedburner.com/FeldThoughts', 'url': 'http://www.feld.com/'},
        {'name': 'AVC', 'rss': 'http://feeds.feedburner.com/avc', 'url': 'http://avc.com/'},
        {'name': 'YCBlog', 'rss': 'https://blog.ycombinator.com/posts.atom'},
        {'name': 'Alex Iskold', 'rss': 'https://alexiskold.net/feed/'}
    ],
    'AI & Machine Learning': [
        {'name': 'R Bloggers', 'rss': 'https://www.r-bloggers.com/feed/'},
        {'name': 'KD Nuggets', 'rss': 'http://www.kdnuggets.com/feed'},
        {'name': 'Kaggle', 'rss': 'http://blog.kaggle.com/feed/'}
    ],
    'News': [
        {'name': 'CNN', 'rss': 'http://rss.cnn.com/rss/cnn_topstories.rss', 'url': 'http://cnn.com'},
        {'name': 'New York Times', 'rss': 'http://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml', 'url': 'http://nytimes.com'},
        {'name': 'BBC', 'rss': 'http://feeds.bbci.co.uk/news/rss.xml?edition=us', 'url': 'http://www.bbc.com'}
    ],
    'VR': [
        //{'name': 'Road To VR', 'rss': 'http://www.roadtovr.com/feed/'},
        {'name': 'Upload VR', 'rss': 'http://uploadvr.com/feed/'},
        //{'name': 'OVRNews', 'rss': 'http://www.ovrnews.com/feed/'},
        {'name': 'HTC Vive', 'rss': 'http://blog.vive.com/us/feed/'}
    ]
}

app.load({
    hooks: { grunt: false },
    log: { level: 'info' }
}, function sailsReady(err) {

    if (err) {
        sails.log.error('Error loading app:', err);
        return process.exit(1);
    }

    sails.log.info('Starting to load the initial data...');

    let topicNames = Object.keys(initialData)

    function createTopic(topicName, callback) {

        sails.models.topics.findOrCreate({'name': topicName}).exec(function (err, topic) {
            sails.log.info(`inserted topic ${topicName}`)
            callback(err, topic)
        })

    }

    async.map(topicNames, createTopic, function(err, topics) {

        if (err) {
            sails.log.error(err)
            process.exit(0)
        }

        sails.log.info('inserted all topics, feeds are up next')
        function insertFeeds(topic, callback) {

            let feedsToCreate = initialData[topic.name]

            function createFeed(feedToCreate, callback) {

                let url = feedToCreate.url || feedToCreate.rss,
                    hostname = urlLibrary.parse(url).hostname

                 sails.models.sites.findOrCreate({ siteUrl: hostname }, { siteUrl: hostname, name: feedToCreate.name }).exec(function(err, site) {

                     sails.log.info(`inserted site ${hostname}`)

                     if (err) {
                         sails.log.error(err)
                         process.exit(0)
                     }

                     sails.models.feeds.findOrCreate({site: site.id, feedUrl: feedToCreate.rss, topic:topic.id}).exec(function(err, feedObject) {
                         if (err) {
                             sails.log.error(err)
                             process.exit(0)
                         }
                         sails.log.info(`inserted feed ${feedObject.feedUrl}`)
                         callback(err, feedObject)
                     })

                 })

            }

            async.map(feedsToCreate, createFeed, callback)

        }

        async.map(topics, insertFeeds, function(err, results) {

            if (err) {
                sails.log.error(err)
                process.exit(0)
            }

            sails.log.info('Completed inserting feeds, wicked!')
            sails.log.info('All done setting up your initial data...')
            process.exit(0)

        })
    })

});
