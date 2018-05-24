# Winds 2.0 - A Beautiful Open Source RSS & Podcast App


[![Open Source](https://img.shields.io/badge/Open%20Source-100%25-green.svg)](httpds://shields.io/)
[![Platform](https://img.shields.io/badge/Platform-Electron-green.svg)](httpds://shields.io/)
[![Awesome Badge](https://img.shields.io/badge/Awesomeness-Very%20High-green.svg)](https://shields.io/)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-Yes-green.svg)](https://github.com/GetStream/winds/graphs/commit-activity)
[![Built With](https://img.shields.io/badge/Built%20With-❤️%20in%20Boulder,%20CO-green.svg)](httpds://shields.io/)
[![StackShare](https://img.shields.io/badge/tech-stack-0690fa.svg?style=flat)](https://stackshare.io/stream/winds)

**What's new: In addition to the desktop apps there's now a web version of Winds available at [https://winds.getstream.io/](https://winds.getstream.io/)**

**Due to overwhelming success of Wind's launch we could use a bit of help. We're hiring a remote Node fullstack dev to work on this open source project fulltime. Contact tommaso@getstream.io for details. Due to budget limitations the position is a better match for developers outside of the US.**

Winds is a beautiful open-source RSS and Podcast app created using React/Redux/Node. Use the free hosted version or run it on your own server and customize it as you see fit. Contributions are always appreciated. In fact we're planning a series of tutorials to help you get started. Activity Feeds & Discovery in Winds are powered by [Stream](https://getstream.io/get_started/), the app leverages [Algolia](https://algolia.com?ref=stream) for search, [AWS](https://aws.amazon.com/) for hosting, [MongoDB Atlas](http://mbsy.co/mongodb/228644) for a hosted database (DBaaS), and [SendGrid](https://sendgrid.com/) for email. All of these services have a free tier.

### **To get started with Winds 2.0, please visit [https://getstream.io/winds/](https://getstream.io/winds/)**

![Winds 2.0](https://i.imgur.com/n2eKwPf.gif)

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

*   [ ] Mark Read (partially implemented)
*   [ ] Playlist support (partially implemented)
*   [ ] Team support (share an activity feed with colleagues or friends to discover and collaborate)
*   [ ] Mobile application powered by React Native
*   [ ] SSO (Google & Twitter)
*   [ ] Folder Support
*   [ ] Listen to feed changes in realtime

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

## Tutorials

The following tutorials will not only help you start contributing to Winds, but also provide inspiration for your next app.

**Note:** We're actively working on this portion of the README. To stay up to date with the latest information, please signup for the hosted version at [https://getstream.io/winds](https://getstream.io/winds).

1.  Architecting a large React/Redux codebase
2.  Building activity streams and newsfeeds on top of Stream
3.  Implementing search with Algolia
4.  Deploying to AWS ECS
5.  MongoDB database schema design
6.  Design thought process for Winds 2.0
7.  PM2 in production environments
8.  Creating a RESTful API design with Express.js
9.  Preparing an Electron app for deployment to the macOS store
10. Deploying to the macOS store
11. Electron gotchas

## Download

To download Winds 2.0, visit [https://getstream.io/winds/](https://getstream.io/winds/).

## Contributing to Winds

### TL;DR

Commands:

*   `brew install pkg-config cairo redis mongodb`
*   `brew services start mongodb`
*   `brew services start redis`
*   `cd winds/api`
*   `yarn`
*   `cd ../app`
*   `yarn`


Sign up for both Stream and Algolia, and create the following `.env` file in the `app` directory, replacing the keys where indicated:

```
DATABASE_URI=mongodb://localhost/WINDS
CACHE_URI=redis://localhost:6379
JWT_SECRET=some-super-secret-arbitrary-jwt-string
API_PORT=8080
REACT_APP_API_ENDPOINT=http://localhost:8080
STREAM_API_BASE_URL=https://windspersonalization.getstream.io/personalization/v1.0

STREAM_APP_ID=YOUR_STREAM_APP_ID
STREAM_API_KEY=YOUR_STREAM_API_KEY
STREAM_API_SECRET=YOUR_STREAM_API_SECRET

REACT_APP_ALGOLIA_APP_ID=YOUR_ALGOLIA_APP_ID
REACT_APP_ALGOLIA_SEARCH_KEY=YOUR_ALGOLIA_SEARCH_ONLY_API_KEY
ALGOLIA_WRITE_KEY=YOUR_ALGOLIA_ADMIN_API_KEY

MERCURY_KEY=YOUR_KEY_HERE
```

Then run:

*   `pm2 start process_dev.json`
*   `cd app && yarn start`

### Clone the Repo

```bash
git clone git@github.com:GetStream/winds.git
```

### Install dependencies

The following instructions are geared towards Mac users who can use `brew` ([Homebrew](https://brew.sh/)) to install most dependencies. Ubuntu users can use `apt`, and Windows users will have to install directly from the dependency's site. Non-debian-based Linux users will probably be able to figure it out on their own :)

*   `cd Winds/app`
*   `yarn`
*   `cd ../api`
*   `yarn`

### Create a dotenv file

A `.env` file contains all configuration and connection strings for Winds.

Create a new file titled `.env` inside the `app` folder, and add the following:

```
DATABASE_URI=mongodb://localhost/WINDS
CACHE_URI=redis://localhost:6379
JWT_SECRET=some-super-secret-arbitrary-jwt-string
API_PORT=8080
REACT_APP_API_ENDPOINT=http://localhost:8080
STREAM_API_BASE_URL=https://windspersonalization.getstream.io/personalization/v1.0
MERCURY_KEY=YOUR_API_KEY_HERE
```

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

If you're on a Mac, you can install MongoDB through [Homebrew](https://brew.sh/) by running:

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

| feed group name | feed group type |
| --------------- | --------------- |
| `podcast`       | flat            |
| `rss`           | flat            |
| `user`          | flat            |
| `timeline`      | flat            |
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

### Building a Production Version

Build a production version of Winds by running:

```
./build.sh
```

This creates production-ready JS files in api/dist.

To run the production JS files:

```
pm2 start process_prod.json
```

## Debugging RSS & Podcast Issues

Unfortunately there is no unified standard for RSS. To test your preferred feed, go to `api/src/workers` and run:

```
babel-node feed_debug.js --rss https://techcrunch.com/feed/
```

For podcasts run:

```
babel-node feed_debug.js --podcast https://www.npr.org/rss/podcast.php\?id\=510289
```

Pull requests for improved RSS compatibility are much appreciated.
Most of the parsing codebase is located in `api/src/workers/parsers.js`.

## Support

All support is handled via [GitHub Issues](https://github.com/getstream/winds/issues). If you're unfamiliar with creating an Issue on GitHub, please follow [these instructions](https://help.github.com/articles/creating-an-issue/).

## Maintenance and Contributions

Thank you to all of the maintainers and contributors who've helped Winds become what it is today and help it stay up and running every day. We couldn't do it without you!

### Special Shoutouts To:

*   [Hackernoon](https://hackernoon.com/)
*   [Product Hunt](https://www.producthunt.com/)

### Primary Maintainers

*   [Nick Parsons](https://github.com/nparsons08)
*   [Ken Hoff](https://github.com/kenhoff)
*   [Thierry Schellenbach](https://github.com/tschellenbach)
*   [Josh Tilton](https://github.com/tilton)

### Contributors

*   [Tommaso Barbugli](https://github.com/tbarbugli)
*   [Dwight Gunning](https://github.com/dwightgunning)
*   [Matt Gauger](https://github.com/mathias)
*   [Zhomart Mukhamejanov](https://github.com/Zhomart)
*   [Julian Xhokaxhiu](https://github.com/julianxhokaxhiu)
*   [Jonathon Belotti](https://github.com/thundergolfer)
*   [The Gitter Badger](https://github.com/gitter-badger)
*   [Meriadec Pillet](https://github.com/meriadec)
*   [Alex Sinnott](https://github.com/sifex)
*   [Lawal Sauban](https://github.com/sauban)
