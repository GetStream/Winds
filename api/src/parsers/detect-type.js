import { ReadFeedURL, ReadFeedStream } from './feed.js';

// determines if the given feedStream is a podcast or not
export async function IsPodcastStream(feedStream) {
	let posts = await ReadFeedStream(feedStream);
	let isPodcast = false;
	if (posts) {
		isPodcast = posts.slice(0, 10).every(post => {
			return (
				post.enclosures.length && post.enclosures[0].type.indexOf('audio') != -1
			);
		});
	}
	return isPodcast;
}

// IsPodcastURL checks if the given url is a podcast or not
export async function IsPodcastURL(feedURL) {
	let feedStream = await ReadFeedURL(feedURL);
	let isPodcast = await IsPodcastStream(feedStream);
	return isPodcast;
}
