![Winds - An Open Source Personalized RSS Reader](https://github.com/GetStream/Winds/raw/master/screenshots/ss-0.png "Winds - An Open Source Personalized RSS Reader")

# Winds - An Open Source Personalized RSS Reader

[![Build Status](https://travis-ci.org/GetStream/Winds.svg?branch=master)](https://travis-ci.org/GetStream/Winds)
[![Dependency Status](https://david-dm.org/GetStream/Winds.svg)](https://david-dm.org/GetStream/Winds)
[![Join the chat at https://gitter.im/GetStream/Winds](https://badges.gitter.im/GetStream/Winds.svg)](https://gitter.im/GetStream/Winds?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Open Source Love](https://badges.frapsoft.com/os/v2/open-source.png?v=103)](https://github.com/ellerbrock/open-source-badge/)

Open source &amp; beautiful RSS reader built using React/Redux/Sails/Node 7 and Stream (getstream.io). Showcases personalized feeds (using machine learning similar to Facebook, Flipboard, Etsy, and Quora - powered by the [getstream.io API](https://getstream.io/)).

This tutorial explains how the personalization API works ([blogpost](http://bit.ly/personalization-winds)). Check out the hosted demo at [http://winds.getstream.io](http://winds.getstream.io/).

Note: We launched this project in November of 2016. We're actively working on it and contributions are much appreciated!

## Screenshots

![Winds - Open source RSS reader - Personalized feed](https://github.com/GetStream/Winds/raw/master/screenshots/ss-2.png "Winds - Open source RSS reader")

![Winds - Open source RSS reader - Chronological feed](https://github.com/GetStream/Winds/raw/master/screenshots/ss-3.png "Winds - Open source RSS reader")

![Winds - Open source RSS reader - Select topics](https://github.com/GetStream/Winds/raw/master/screenshots/ss-1.png "Winds - Open source RSS reader")

## Demo

Check out the hosted demo: [winds.getstream.io](http://winds.getstream.io/)

## Installation

### Step 0 - Git clone

```bash
git clone https://github.com/GetStream/Winds.git
```

### Step 1 - Node & requirements

```bash
cd Winds
```

```bash
brew install nvm
nvm install 7.0.0
```

```bash
npm install .
npm install -g sails pm2
```

### Step 2 - Secrets

Create a file called `.env` by duplicating `.env_example` using this command:

```bash
 cp .env_example .env
```

Now the `.env` file will have the following values:

```bash
STREAM_APP_ID = ""
STREAM_API_KEY = ""
STREAM_API_SECRET = ""
STREAM_ANALYTICS_TOKEN = ""
SENDGRID_USERNAME = ""
SENDGRID_PASSWORD = ""
SENTRY_DSN = ""
API_BASE_URL = "http://localhost:1337"
MONGO_URI = ""
FACEBOOK_API_KEY = ""
REDIS_AUTH = ""
JWT_SECRET = ""
```

**Stream**

Stream handles the feed personalization and storage. Accounts are free up to 3 million feed updates and handle personalization (machine learning) for up to 100 users.

Get started at [getstream.io](https://getstream.io/) and visit the [dashboard](https://getstream.io/dashboard/) to get your credentials.

While you're in the dashboard, you'll also want to create the following feed types:

* rss_feed (type = flat, realtime notifications = off)
* timeline (type = flat, realtime notifications = on)
* user (type = flat, realtime notificatons = off)
* topic (type = flat, realtime notifications = on)

**Email**

To send email create an account on [sendgrid.com](https://sendgrid.com/) and add your username and password. You can use other providers by customizing config/emails.js

**Error Reporting (optional)**

To track errors create an account on [sentry.io](https://sentry.io/). Next add your Sentry DSN to the `.env` file.

**Database (optional)**

Sails uses an ORM called [Waterline](https://github.com/balderdashy/waterline), which supports [many databases](https://github.com/balderdashy/waterline-docs#supported-adapters). If you don't provide the Mongo URI ,it will store your data on local disk. This is fine for trying out the app; however it is not a solution for a production level app. The full details are available in `config/connections.js`.

### Step 3 - Scrape Some Data

A reader without any data isn't much fun though. Let's insert a few topics and RSS feeds into the database:

```bash
node load_initial_data.js
```

### Step 4 - Redis

Redis is currently used as the primary session store. To install on macOS, simply use Homebrew:

```bash
brew install redis
```

Then run Redis with the following command:

```bash
redis-server
```

### Step 5 - Launch!

Next, we need to run 2 cronjobs to ensure we keep on reading RSS articles and update the site's favicons. To make it easy to keep these cronjobs up and running, we use the amazing [PM2](https://github.com/Unitech/pm2) library:

```
pm2 start process_dev.json
```

This command runs 3 cron jobs and the app on port 1337. You can change the port in `process_dev.json`. Alternatively, you can use `process_prod.json`. The production config uses a background worker for scraping the RSS feeds. It will work better if you expect to scrape thousands of feeds.

**Development**

To run in development mode, run `sails lift` in the command line like so:

```bash
sails lift
```

You can now see your own RSS reader at: [localhost:1337](http://localhost:1337/)

### Step 5 - Enjoy

Point your browser to: [localhost:1337](http://localhost:1337/), follow topics, create an account and add feeds as you please.

## Contributing to This Project

### Project Layout

**React**

The React codebase is located in `/assets/js`. There you'll find the `actions`, `components` and `reducers`.

**API**

The API is located in `/api`. It uses [Sails](http://sailsjs.org/), so their [documentation](http://sailsjs.org/documentation/concepts/) is a good place to start.

**Design**

The [Sketch File](https://www.sketchapp.com/) files are available for [download via Invision](https://invis.io/a/ZA9KFVTRPFX95).

### Ideas for Improvements

Contributions are much appreciated. Here are some ideas for improvements:

* Secondary links (ie comments link for HNews and Lobsters)
* Deploy to Heroku button
* Follow suggestions (we're working on this)
* Switching between feeds should be easier
* Lightweight task queuing system for emails and discover endpoint
* Keyboard shortcuts (vim style)
* GraphQL style APIs so you have more flexibility for building your own mobile apps
* Android & iOS apps
* Support more sites (RSS data quality is pretty poor and often needs custom logic per site/feed)
* Search article's you've read using [Algolia](https://www.algolia.com/)
* Folders/Groups

### Roadmap

At the moment we're gathering feedback from the community before deciding on the changes for Winds 0.2

### Adding Support for Your Favorite Feeds

Unfortunately, RSS is more of a guideline than a standard. There is a good chance that the feed you're trying to add isn't correctly parsed. If this happens, there are two things you can do:

1. You can submit an issue. Be sure to specify the exact url you tried to add. Every now and then we will go over these outstanding issues and try to resolve them.

2. If you're a developer you'll want to fork our project. As a starting point you can add a test in discover.test.js and run it

```
NODE_ENV=testing mocha test/bootstrap.test.js test/integration/**/*discover* -g sentry
```

Next you'll want to open up ScrapingService.js and DiscoverService.js. Most of the time you can resolve the problem by adding an if statement in these files. If statements are of course an ugly solution. After we learn more about the type of customization required per feed, we'll add support for subclassing and extending the scraping logic.

### Running the Test Cycle

We use Mocha for the test cycle. It's a pretty default setup for Sails. The only tricky bit is that you to specify the NODE_ENV as testing. You also need to load test/bootstrap.test.js before executing other tests. Here is an example:

Run all tests:
```bash
NODE_ENV=testing mocha test/bootstrap.test.js test/integration/**/**
```

### Style Guide

Running JS Beautify

```bash
find . -name '*.js' | grep -v node_modules | grep -v tmp | xargs -n 1 js-beautify -r
```

### Details About Operations & Cron Jobs

RSS is quite a broken standard. It works, but barely so. You'll often have to customize the scraping logic for specific sites.
Here are a few commands which make it easier to test your feeds:

Scrape the feeds containing avc in the URL. Scrape only 1 article at the time and run with concurrency 1.

```bash
node scrape_feeds.js -q avc -a 1 -c 1
```

Scrape all feeds that weren't updated in the last 3 minutes:

```bash
node scrape_feeds.js
```

Force all feeds to be scraped:

```bash
node scrape_feeds.js -f
```

Scrape the favicons:

```bash
node scrape_favicons.js -c 10 -q cnn
```

## Native macOS Support

Winds supports a native macOS client through the use of [https://github.com/electron/electron](Electron). An example application (macOS) pointed at the [hosted version](http://winds.getstream.io) can be found in the [releases](https://github.com/GetStream/Winds/releases) section this repo.

To install the native macOS application using Homebrew, simply run `brew cask install winds`.

### Building Your Own Native Client

To make the build process easier, we chose to go with the popular tool [Nativefier](https://github.com/jiahaog/nativefier), a command line tool that allows you to easily create a desktop application for any web site with succinct and minimal configuration. Apps are wrapped by Electron in an OS executable (.app, .exe, etc.) for use on Windows, macOS and Linux.

To start, you'll need to install the Nativefier module from NPM in your terminal:

```bash
npm install nativefier -g
```

Then, run the following command to build on macOS:

```bash
nativefier --name "Winds" "https://your-domain.com" --icon "icon.png" --insecure --show-menu-bar
```

The full API documentation can be found at: [https://github.com/jiahaog/nativefier/blob/development/docs/api.md](https://github.com/jiahaog/nativefier/blob/development/docs/api.md)


## Powered By

* [React](https://facebook.github.io/react/)
* [Redux](https://github.com/reactjs/react-redux)
* [Sails](http://sailsjs.org/)
* [Sentry](https://sentry.io/welcome/)
* [Sendgrid](https://sendgrid.com)
* [Stream](https://getstream.io)
* [MongoDB](https://www.mongodb.com/)
* [Nativefier](https://github.com/jiahaog/nativefier)
* [PM2](http://pm2.keymetrics.io/)
