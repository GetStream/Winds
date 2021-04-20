# Winds - A Beautiful Open Source RSS & Podcast App Powered by GetStream.io

[![Slack Community](https://img.shields.io/badge/Slack%20Community-Get%20Invite-green.svg)](https://communityinviter.com/apps/winds-community-hq/winds-2-0)
[![Build Status](https://travis-ci.org/GetStream/Winds.svg?branch=master)](https://travis-ci.org/GetStream/Winds)
[![codecov](https://codecov.io/gh/GetStream/Winds/branch/master/graph/badge.svg)](https://codecov.io/gh/GetStream/Winds)
[![Open Source](https://img.shields.io/badge/Open%20Source-100%25-green.svg)](https://shields.io/)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-Yes-green.svg)](https://github.com/GetStream/winds/graphs/commit-activity)
[![Built With](https://img.shields.io/badge/Built%20With-❤️%20in%20Boulder,%20CO-green.svg)](httpds://shields.io/)
[![StackShare](https://img.shields.io/badge/Tech-Stack-0690fa.svg?style=flat)](https://stackshare.io/stream/winds)

## Description

Winds is a beautiful open-source RSS and Podcast app created using React & Redux on the frontend and Express.js on the backend. Use the free hosted version or run it on your own server and customize it as you see fit. Contributions in form of pull requests are always appreciated. Activity Feeds & Discovery in Winds are powered by [Stream](https://getstream.io/get_started/), the app leverages [Algolia](https://algolia.com?ref=stream) for search, [AWS](https://aws.amazon.com/) for hosting, [MongoDB Atlas](http://mbsy.co/mongodb/228644) for a hosted database (DBaaS), and [SendGrid](https://sendgrid.com/) for email. All of these services have a free tier.

## Getting Started

To get started with Winds, please download [the latest release](https://s3.amazonaws.com/winds-2.0-releases/latest.html)

## What's New

In addition to the desktop apps for [macOS](https://s3.amazonaws.com/winds-2.0-releases/latest.html), [Linux](https://s3.amazonaws.com/winds-2.0-releases/latest.html), and [Windows](https://s3.amazonaws.com/winds-2.0-releases/latest.html), there's now a web version of Winds available at [https://winds.getstream.io/](https://winds.getstream.io/)

## Featured RSS & Podcasts

Have a popular RSS or Podcast and want to be featured? Reach out to winds@getstream.io. We reply to every message.

# Features at a Glance
Winds is packed full of awesome features behind a beautiful user interface and user experience. Here's a quick look at what the project has to offer:

## Beautiful UI
![Winds UI](https://i.imgur.com/W1fpowV.png)

## RSS & Podcast Recommendations
![Winds RSS & Podcast Recommendations](https://i.imgur.com/AlVgDTg.png)

## Integrated Search
![Winds Search](https://i.imgur.com/zaWtNfV.png)

## Podcast Player
![Winds Podcast Player](https://i.imgur.com/th247rA.png)

## RSS Reader
![Winds RSS Reader](https://i.imgur.com/D3wt7W3.png)


## TOCd

*   [Roadmap](#roadmap)
*   [Powered By](#powered-by)
    *   [Stream](#stream)
    *   [Algolia](#algolia)
    *   [MongoDB](#mongodb)
    *   [SendGrid](https://sendgrid.com)
    *   [AWS](https://aws.amazon.com/)
*   [Tutorials](#tutorials)
*   [Download](#download)
*   [Contributing to Winds](#contributing-to-winds)
*   [Support](#support)
*   [Maintenance & Contributions](#maintenance-and-contributions)

## Roadmap

Help us improve Winds and/or vote on the [Roadmap for 2.1](https://github.com/GetStream/Winds/issues/191)

*   [ ] Search detail screen
*   [ ] Playlist support (partially implemented)
*   [ ] Team support (share an activity feed with colleagues or friends to discover and collaborate)
*   [ ] Mobile application powered by React Native

## Powered By

1.  [Express](https://expressjs.com?ref=winds)
2.  [React](https://reactjs.org?ref=winds) & [Redux](https://redux.js.org?ref=winds)
3.  [Algolia](https://www.algolia.com?ref=winds)
4.  [MongoDB Atlas](http://mbsy.co/mongodb/228644)
5.  [SendGrid](https://sendgrid.com?ref=winds)
6.  [Bull](https://github.com/OptimalBits/bull?ref=winds)
7.  [Mercury](https://mercury.postlight.com?ref=winds)
8.  [Stream](https://getstream.io?ref=winds)
9.  [Sentry](https://sentry.io/?ref=winds)
10. [AWS](https://aws.amazon.com/?ref=winds)

**The full stack can be found on [StackShare.io](https://stackshare.io/stream/winds).**

### Stream

[Stream](https://getstream.io/?ref=winds) is an API for building activity feeds. For Winds the follow suggestions and the list of articles from the feeds you follow is powered by Stream. Stream accounts are free for up to 3 million feed updates and handle personalization (machine learning) for up to 100 users.

### Algolia

[Algolia](https://algolia.com?ref=winds) is used for lightning fast and relevant search. We use their [JavaScript search client](https://www.npmjs.com/package/algoliasearch?ref=winds) to easily setup the Winds search implementation. Algolia, accounts are free up to 10k records and 100k operations.

### MongoDB

[MongoDB Atlas](http://mbsy.co/mongodb/228644) provides a Database as a Service, and serves as the backend datastore for Winds.

## Tutorials & Blog Posts

The following tutorials will not only help you start contributing to Winds, but also provide inspiration for your next app.

**Note:** We're actively working on this portion of the README. To stay up to date with the latest information, please signup for the hosted version at [https://getstream.io/winds](https://getstream.io/winds).

1.  [Implementing search with Algolia](https://hackernoon.com/integrating-algolia-search-in-winds-a-beautiful-rss-podcast-application-f231e49cdab5)
2.  [Stream and Winds](https://getstream.io/blog/the-engine-that-powers-winds/)
3.  [Running PM2 & Node.js in Production Environments](https://hackernoon.com/running-pm2-node-js-in-production-environments-13e703fc108a)
4.  [Creating a RESTful API design with Express.js](https://hackernoon.com/building-a-node-js-powered-api-with-express-mongoose-mongodb-19b14fd4b51e)
5. [Takeaways on Building a React Based App with Electron](https://medium.com/@nparsons08/publishing-a-react-based-app-with-electron-and-nodejs-f5ec44169366)
6. [The Winds Stack](https://stackshare.io/stream/how-stream-built-a-modern-rss-reader-with-javascript)
7. [Building Touch Bar Support for macOS in Electron with React](https://hackernoon.com/winds-2-1-building-touch-bar-support-for-macos-in-electron-with-react-e10adb811c91)
8. [Testing Node.js in 2018](https://hackernoon.com/testing-node-js-in-2018-10a04dd77391)
9. [Simple Steps to Optimize Your App Performance with MongoDB, Redis, and Node.js](https://hackernoon.com/simple-steps-to-optimize-your-app-performance-5700d8b58f58)
10. [Getting Started with Winds & Open Source](https://hackernoon.com/winds-an-in-depth-tutorial-on-making-your-first-contribution-to-open-source-software-ebf259f21db2)
11. [Deploying the Winds App to Amazon S3 and CloudFront](https://getstream.io/blog/deploying-the-winds-app-to-amazon-s3-and-cloudfront/)
12. [Deploying the Winds API to AWS ECS with Docker Compose](https://getstream.io/blog/deploying-the-winds-api-to-aws-ecs-with-docker-compose/)

## Download

To download Winds, visit [https://getstream.io/winds/](https://getstream.io/winds/).

## Contributing to Winds

### TL;DR

Commands:

*   `brew install redis mongodb`
*   `brew services start mongodb`
*   `brew services start redis`
*   `cd Winds`
*   `cd api && yarn`
*   `cd ../app && yarn`


Sign up for both Stream and Algolia, and create the following `.env` file in the `app` directory, replacing the keys where indicated:

```
DATABASE_URI=mongodb://localhost/WINDS_DEV
CACHE_URI=redis://localhost:6379
JWT_SECRET=YOUR_JWT_SECRET

API_PORT=8080
REACT_APP_API_ENDPOINT=http://localhost:8080
STREAM_API_BASE_URL=https://windspersonalization.getstream.io/personalization/v1.0

STREAM_APP_ID=YOUR_STREAM_APP_ID
REACT_APP_STREAM_APP_ID=YOUR_STREAM_APP_ID
REACT_APP_STREAM_API_KEY=YOUR_STREAM_API_KEY
REACT_APP_STREAM_ANALYTICS=YOUR_STREAM_ANALYTICS_TOKEN
STREAM_API_KEY=YOUR_STREAM_API_KEY
STREAM_API_SECRET=YOUR_STREAM_API_SECRET

REACT_APP_ALGOLIA_APP_ID=YOUR_ALGOLIA_APP_ID
REACT_APP_ALGOLIA_SEARCH_KEY=YOUR_ALGOLIA_SEARCH_ONLY_API_KEY
ALGOLIA_WRITE_KEY=YOUR_ALGOLIA_ADMIN_API_KEY
```

> Note: If you are running the test suite, you will need to have a test version of the `.env` file inside of the `api/test` directory.

Then run:

*   `pm2 start process_dev.json`
*   `cd app && yarn start`

### Clone the Repo

```bash
git clone git@github.com:GetStream/Winds.git
```

### Install dependencies

The following instructions are geared towards Mac users who can use `brew` ([Homebrew](https://brew.sh/)) to install most dependencies. Ubuntu users can use `apt`, and Windows users will have to install directly from the dependency's site. Non-debian-based Linux users will probably be able to figure it out on their own :)

*   `cd Winds/app`
*   `yarn`
*   `cd ../api`
*   `yarn`

### Start MongoDB Locally

Winds uses MongoDB as the main datastore - it contains all users, rss feeds, podcasts, episodes, articles, and shares.

If you're on a Mac, you can install MongoDB through [Homebrew](https://brew.sh/) by running:

```
brew install mongodb
```

_(You can also install MongoDB from the [official MongoDB site](https://www.mongodb.com/download-center).)_

You can also run MongoDB in the background by running:

```
brew services start mongodb
```

### Start Redis Locally

At Stream, we use Redis as an in-memory storage for the Winds podcast processing and RSS processing workers. It contains a list of podcasts and RSS feeds, which the workers pick up and process using the `bull` messaging system.

If you're on a Mac, you can install Redis through [Homebrew](https://brew.sh/) by running:

```
brew install redis
```

_(You can also install Redis from the [official Redis site](https://redis.io/download).)_

Then, start Redis by running:

```
redis-server
```

...which creates (by default) a `dump.rdb` file in your current directory and stores a cached version of the database in that location.

You can also run Redis in the background by running:

```
brew services start redis
```

### Loading Test Data

For testing purposes, you will want to use the test data located [here](https://s3.amazonaws.com/winds-hosted/static/export/WINDS.zip).

Use [`mongoimport`](https://docs.mongodb.com/manual/reference/program/mongoimport/) or [`mongorestore`](https://docs.mongodb.com/manual/reference/program/mongorestore/) to import the data. There are two username and password combinations for testing:

**Username**: `admin@admin.com`<br/>
**Password**: `admin`
<br/><br/>
**Username**: `test@test.com`<br/>
**Password**: `test`

You will need to run the `FLUSHALL` command in Redis to ensure that the new content is picked up.

> Note: This will override any local data that you may have. Please be cautious! Also, this will not create Stream follows – please follow feeds manually to generate them.

### Stream

#### Sign up and Create a Stream App

To contribute to Winds, sign up for [Stream](https://getstream.io/get_started?ref=winds) to utilize the activity and timeline feeds.

_(Reminder: Stream is free for applications with less than 3,000,000 updates per month.)_

*   [Sign up for Stream here](https://getstream.io/get_started?ref=winds)
*   Create a new Stream app
*   Find the App ID, API Key, and API Secret for your new Stream app

#### Add your Stream App ID, API Key, and API Secret to your `.env`

Append the Stream App ID, API Key, and API secret to your `.env` file:

```
STREAM_APP_ID=YOUR_STREAM_APP_ID
STREAM_API_KEY=YOUR_STREAM_API_KEY
STREAM_API_SECRET=YOUR_STREAM_API_SECRET
```

#### Create Your Stream Feed Groups

Once you've signed in, create "feed groups" for your Stream app.

A "feed group" defines a certain type of feed within your application. Use the "Add Feed Group" button to create the following feeds:

| Feed Group Name | Feed Group Type |
| --------------- | --------------- |
| `podcast`       | flat            |
| `rss`           | flat            |
| `user`          | flat            |
| `timeline`      | flat            |
| `folder`        | flat            |
| `user_episode`  | flat            |
| `user_article`  | flat            |

It's fine to enable "Realtime Notifications" for each of these feed groups, though we won't be using those yet.

### Algolia

#### Sign up for Algolia and Create an Algolia App and Index

In addition to Stream, you also need to sign up for [Algolia](https://www.algolia.com/users/sign_up?ref=winds), to contribute to Winds, for the search functionality.

_(Algolia is free for applications with up to 10k records.)_

*   [Sign up for Algolia here](https://www.algolia.com/users/sign_up?ref=winds)
*   From the [Applications page](https://www.algolia.com/manage/applications), click "New Application" and create a new Algolia application. (We recommend something similar to `my-winds-app`)
    *   (Select the datacenter that's closest to you.)
*   From the application page, select "Indices" and click "Add New Index". (We recommend something similar to `winds-main-index`)

#### Add Your Algolia Application Id, Search-Only Api Key and Admin Api Key to Your `.env` File

From your app, click the "API Keys" button on the left to find your app ID and API keys.

Append your Algolia application ID, search-only API Key and Admin API Key to your `.env` file to look like this:

```
REACT_APP_ALGOLIA_APP_ID=YOUR_ALGOLIA_APP_ID
REACT_APP_ALGOLIA_SEARCH_KEY=YOUR_ALGOLIA_SEARCH_ONLY_API_KEY
ALGOLIA_WRITE_KEY=YOUR_ALGOLIA_ADMIN_API_KEY
```

### Start Backend Services

From the root directory, run:

```
pm2 start process_dev.json
```

To see logging information for all processes, run:

```
pm2 logs
```

### Start Frontend Electron / Web App Server

```
cd app && yarn start
```

### Running tests

Winds API server uses:

* [Mocha](https://mochajs.org) as testing framework
* [Chai](https://chaijs.org) as assertion library
* [Sinon](https://sinonjs.org) as mocking library
* [nock](https://github.com/node-nock/nock) as HTTP mocking library
* [mock-require](https://github.com/boblauer/mock-require) as module mocking library

Tests are located in [`api/test` folder](https://github.com/GetStream/Winds/tree/master/api/test).

File structure is intentionally mirroring files in `api/src` to simplify matching tests to tested code.

To run tests:

```
cd api && yarn run test
```

To run tests with extended stack traces (useful when debugging async issues):

```
cd api && yarn run test_deep
```

#### Adding new tests

Add your code to a file in `api/test` folder (preferably mirroring existing file from `api/src` folder).

Refer to [Mocha documentation](https://mochajs.org/#getting-started) for examples of using BDD-like DSL for writing tests.

Modules are mocked in [`api/test-entry.js`](https://github.com/GetStream/Winds/blob/master/api/test-entry.js#L21L27) as mocks have to be installed before any modules are loaded.

Fixtures are loaded via [`loadFixture`](https://github.com/GetStream/Winds/blob/master/api/test/utils.js#L59L101) function from [`api/test/fixtures` folder](https://github.com/GetStream/Winds/tree/master/api/test/fixtures)

Various utility functions are provided in [`api/test/util.js`](https://github.com/GetStream/Winds/blob/master/api/test/utils.js) (See other tests for examples of usage).

### Building a Production Version

Build a production version of Winds by running from root directory:

```
./api/build.sh
```

This creates production-ready JS files in api/dist.

To run the production JS files:

```
pm2 start process_prod.json
```

OR

**Prepare the build for Docker**:

`cd api && cd scripts && ./make-build.sh`

**Build the Docker container (API & all workers)**:

`cd ../ && docker-compose up`

The commands above will prepare and start the API (and all workers). The frontend will still need to be started manually.

## Debugging RSS & Podcast Issues

Unfortunately there is no unified standard for RSS.
Go to the `api` directory and run `yarn link` to make these commands available:

```
winds rss https://techcrunch.com/feed/
```

**Podcasts**:

```
winds podcast https://www.npr.org/rss/podcast.php\?id\=510289
```

**Open Graph scraping**:

```
winds og http://www.planetary.org/multimedia/planetary-radio/show/2018/0509-amy-mainzer-neowise.html
```

**RSS Discovery**:

```
winds discover mashable.com
```

**Article parsing (w/ Mercury)**:

```
winds article https://alexiskold.net/2018/04/12/meet-12-startups-from-techstars-nyc-winter-2018-program/
```

Pull requests for improved RSS compatibility are much appreciated.
Most of the parsing codebase is located in `api/src/parsers/`.

## Support

All support is handled via [GitHub Issues](https://github.com/getstream/winds/issues). If you're unfamiliar with creating an Issue on GitHub, please follow [these instructions](https://help.github.com/articles/creating-an-issue/).

## Maintenance and Contributions

Thank you to all of the maintainers and contributors who've helped Winds become what it is today and help it stay up and running every day. We couldn't do it without you!

### Special Shoutouts To:

*   [Hackernoon](https://hackernoon.com/)
*   [Product Hunt](https://www.producthunt.com/)
*   [StackShare](https://stackshare.io/stream/how-stream-built-a-modern-rss-reader-with-javascript)

### Primary Maintainers

*   [Nick Parsons](https://github.com/nparsons08)
*   [Amin Mahboubi](https://github.com/mahboubii)
*   [Thierry Schellenbach](https://github.com/tschellenbach)
*   [Josh Tilton](https://github.com/tilton)

### Contributors

*   [Tommaso Barbugli](https://github.com/tbarbugli)
*   [Ken Hoff](https://github.com/kenhoff)
*   [Dwight Gunning](https://github.com/dwightgunning)
*   [Matt Gauger](https://github.com/mathias)
*   [Max Klyga](https://github.com/nekuromento)
*   [Zhomart Mukhamejanov](https://github.com/Zhomart)
*   [Julian Xhokaxhiu](https://github.com/julianxhokaxhiu)
*   [Jonathon Belotti](https://github.com/thundergolfer)
*   [The Gitter Badger](https://github.com/gitter-badger)
*   [Meriadec Pillet](https://github.com/meriadec)
*   [Alex Sinnott](https://github.com/sifex)
*   [Lawal Sauban](https://github.com/sauban)

## Revive RSS

RSS is an amazing open standard. It is probably the most pleasant way to stay up to date with the sites and podcasts you care about. Our reasons for contributing to Winds are explained in the blogpost [Winds 2.0 It's time to Revive RSS](https://getstream.io/blog/winds-2-0-its-time-to-revive-rss/). In this section we will list other open source and commercial projects that are having an impact on Reviving RSS:

* [Miniflux](https://github.com/miniflux/miniflux)
* [TwitRSSMe](https://twitrss.me/)
* [Feedly](https://feedly.com/)
* [NewsBlur](https://newsblur.com/)
* [Feedity](https://feedity.com/)
* [SaveRSS](https://mg.guelker.eu/saverss/)


## We are hiring!

We've recently closed a [$38 million Series B funding round](https://techcrunch.com/2021/03/04/stream-raises-38m-as-its-chat-and-activity-feed-apis-power-communications-for-1b-users/) and we keep actively growing.
Our APIs are used by more than a billion end-users, and you'll have a chance to make a huge impact on the product within a team of the strongest engineers all over the world.

Check out our current openings and apply via [Stream's website](https://getstream.io/team/#jobs).
