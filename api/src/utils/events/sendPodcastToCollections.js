import events from './index';
import Podcast from '../../models/podcast';
import Episode from '../../models/episode';
import detectPodcastLanguage from '../detectPodcastLanguage';

async function sendPodcastToCollections(podcast) {
	if (!podcast.language) {
		podcast.language = await detectPodcastLanguage(podcast.feedUrl);
		await Podcast.findByIdAndUpdate(podcast.id, { language: podcast.language }, { new: true });
	}
	let episodes = await Episode.find({
		podcast: podcast.id,
	}).sort({ publicationDate: -1 }).limit(1000);

	let eventsData = {
		[`podcast:${podcast.id}`]: {
			articleCount: episodes.length,
			description: podcast.description,
			language: podcast.language,
			mostRecentPublicationDate: episodes[0].publicationDate,
			title: podcast.title,
		}};

	await events({
		meta: {
			data: eventsData,
		},
	});
}

export default sendPodcastToCollections;
