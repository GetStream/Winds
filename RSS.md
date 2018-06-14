
## Post Uniqueness ##

Post uniqueness in an RSS feed can be determined by 4 different methods:

- The guid property on the post (not always present)
- The link property on the post (not always present and sometimes uses the site url)
- The url of the first enclosure (common amongst podcasts)
- A hash of the title, link, description and enclosures

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
