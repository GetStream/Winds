![Winds - Open source RSS reader](https://github.com/GetStream/stream-sails-rss-personalization/raw/master/screenshots/ss-0.png "Winds - Open source RSS reader")


# Winds - Open Source RSS Reader

Open source &amp; beautiful RSS reader built using React/Redux/Sails and Stream (getstream.io). Showcases personalized feeds (using machine learning similar to Facebook, Flipboard, Etsy, Quora - powered by [getstream.io API](https://getstream.io/)). This tutorial explains how the personalization API works (blogpost). Check out the hosted demo: [winds.getstream.io](http://winds.getstream.io/)

Note: We've launched this project in November this year. We're actively working on it and contributions are much appreciated!

## Screenshots

![Winds - Open source RSS reader - Personalized feed](https://github.com/GetStream/stream-sails-rss-personalization/raw/master/screenshots/ss-2.png "Winds - Open source RSS reader")

![Winds - Open source RSS reader - Chronological feed](https://github.com/GetStream/stream-sails-rss-personalization/raw/master/screenshots/ss-3.png "Winds - Open source RSS reader")

![Winds - Open source RSS reader - Select topics](https://github.com/GetStream/stream-sails-rss-personalization/raw/master/screenshots/ss-1.png "Winds - Open source RSS reader")

## Demo

Check out the hosted demo: [winds.getstream.io](http://winds.getstream.io/)

## Installation

### Step 0 - Git clone

```bash
git clone git@github.com:GetStream/stream-sails-rss-personalization.git
```

### Step 1 - Node & requirements

```bash
cd stream-sails-rss-personalization
brew install nvm
nvm install 6.8.0
npm install .
npm install -g sails pm2
```

### Step 2 - Secrets

Create a file called **.env** with your secrets

```bash
STREAM_APP_ID = ''
STREAM_API_KEY = ''
STREAM_API_SECRET = ''
STREAM_ANALYTICS_TOKEN = ''
SENDGRID_USERNAME = ''
SENDGRID_PASSWORD = ''
SENTRY_DSN = ''
MONGO_URI = ''
API_BASE_URL = 'http://localhost:1337'
```

**Stream**

Stream handles the feed personalization and storage. Accounts are free up to 3 million feed updates and handle personalization (machine learning) for up to 100 users. Signup at [getstream.io](https://getstream.io/) and visit the [dashboard](https://getstream.io/dashboard/) to get your credentials

**(optional) Email**

To send email create an account on [sendgrid.com](https://sendgrid.com/) and add your username and password. You can use other providers by customizing config/emails.js

**(optional) Error Reporting**

To track errors create an account on [sentry.io](https://sentry.io/). Next add your Sentry DSN in the .env file.

**(optional) Database**

Sails uses an ORM called Waterline, which supports [many databases](https://github.com/balderdashy/waterline-docs#supported-adapters). If you don't provide the Mongo URI it will store your data on local disk. This is fine for trying out the app. The full details are available in config/connections.js

### Step 3 - Launch!

Next, run sails lift in the command line

```bash
sails lift
```
You can now see your reader at [localhost:1337](http://localhost:1337/)

### Step 4 - Scrape Some Data

A reader without any data isn't much fun though. Let's insert a few topics and rss feeds into the database

```bash
node load_initial_data.js
```

Next we need to run 2 cronjobs to ensure we keep on reading RSS articles and update the site's favicons. To make it easy to keep these cronjobs up and running we use the amazing [PM2](https://github.com/Unitech/pm2) library:

```
pm2 start process.json
```

### Step 5 - Enjoy

Point your browser to [localhost:1337](http://localhost:1337/), follow topics, create an account and add feeds as you please.

## Contributing to This Project

### Project Layout

**React**

The React codebase is located in /assets/js. There you'll find the actions, components and reducers.

**API**

The API is located in /api. It uses [sails](http://sailsjs.org/), so their documentation is a good place to start.

**Design**

The [Sketch](https://www.sketchapp.com/) files are available in /sketch.

### Ideas for improvements

Contributions are much appreciated. Here are some ideas for improvements:

* Follow suggestions (we're working on this)
* Lightweight task queuing system for emails and discover endpoint
* Keyboard shortcuts
* Android & iOS apps
* Support more sites (RSS data quality is pretty poor and often needs custom logic per site/feed)
* Search article's you've read using Algolia
* Folders/Groups
* scrape_feeds and scrape_favicons don't have any help output. we should find a nicer library to handle that.

### Adding support for your favorite feeds

Unfortunately RSS is more of a guideline than a standard. There is a good chance that the feed you're trying to add isn't correctly parsed. If this happens, there are 2 things you can do:

1. You can submit an issue. Be sure to specify the exact url you tried to add. Every now and then we will go over these outstanding issues and try to resolve them.

2. If you're a developer you'll want to fork our project. As a starting point you can add a test in discover.test.js and run it

```
NODE_ENV=testing mocha test/bootstrap.test.js test/integration/**/*discover* -g sentry
```

Next you'll want to open up ScrapingService.js and DiscoverService.js. Most of the time you can resolve the problem by adding an if statement in these files. If statements are of course an ugly solution. After we learn more about the type of customization required per feed, we'll add support for subclassing and extending the scraping logic.

### Running the Test Cycle

We use Mocha for the test cycle. It's a pretty default setup for Sails. The only tricky bit is that you to specify the NODE_ENV as testing. You also need to load test/bootstrap.test.js before executing other tests. Here are some examples:

Run all tests:
```bash
NODE_ENV=testing mocha test/bootstrap.test.js test/integration/**/**
```

Run a specif test
```bash
NODE_ENV=testing mocha test/bootstrap.test.js test/integration/**/*follow* -g dofollow
```

### Style Guide

Running js beautify

```bash
find . -name '*.js' | grep -v node_modules | grep -v tmp | xargs -n 1 js-beautify -r
```

### Details About Operations & Cron Jobs

RSS is quite a broken standard. It works, but barely so. You'll often have to customize the scraping logic for specific sites.
Here are a few commands which make it easier to test your feeds:

Scrape the feeds containing avc in the url. Scrape only 1 article at the time and run with concurrency 1.
```bash
node scrape_feeds.js -q avc -a 1 -c 1
```

Scrape all feeds that weren't updated in the last 3 minutes
```bash
node scrape_feeds.js
```

Force all feeds to be scraped
```bash
node scrape_feeds.js -f
```

Scrape the favicons
```bash
node scrape_favicons.js -c 10 -q cnn
```

## Powered By

* [React](https://facebook.github.io/react/)
* [Redux](https://github.com/reactjs/react-redux)
* [Sails](http://sailsjs.org/)
* [Sentry](https://sentry.io/welcome/)
* [Sendgrid](https://sendgrid.com)
* [Stream](https://getstream.io)
* [MongoDB](https://www.mongodb.com/)
* [PM2](http://pm2.keymetrics.io/)
