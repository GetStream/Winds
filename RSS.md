
## Post Uniqueness ##

Post uniqueness in an RSS feed can be determined by 4 different methods:

- The guid property on the post (not always present)
- The link property on the post (not always present and sometimes uses the site url)
- The url of the first enclosure (common amongst podcasts)
- A hash of the title, link, description and enclosures

Note that the guid shouldn't change. The link, url and hash can change when the post is updated though.
So using the first approach is preferable.

While not available in the RSS feed you could also consider the

- Canonical URL on the page

## RSS feed Uniqueness ##

Determining the uniqueness for an RSS feed is harder.
There are a few different options

- A normalized version of the feed url
- The feed url specified in the RSS doc

Neither of those approaches work as most RSS feeds are available under many different urls.

- A hash based on the last 10 article hashes

## Discovery ##

The standard discovery library picks up the link rel tag in the html.
Many sites have dropped support for this tag though. We could add special cases for

- YouTube
- Wordpress blogs

As it's easy to determine the feed location

## How Winds handles uniqueness ##

For every feed Winds will evaluate which one of these fields are unique:

['guid', 'link', 'enclosure[0].url', 'hash']

Note that the hash is computed before any enrichment is done on the feed content.
After that it stores the unique value in `article.fingerprint` in the format `guid:123` or `hash:123` etc.
After selecting the best algorithm it will use a batch select and update to update the feed articles.

The uniqueness of the last 20 articles is used to compute a hash for the RSS feed.
We use this information to occasionally merge RSS feeds.
After merging the alternative URLs are stored to prevent people from submitting the same feed under a different url.
