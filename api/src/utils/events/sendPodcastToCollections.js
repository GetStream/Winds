import events from './index';
import Podcast from '../../models/podcast';
import Episode from '../../models/episode';
import { DetectLanguage } from '../../parsers/detect-language';

async function sendPodcastToCollections(podcast) {
	if (!podcast.language) {
		podcast.language = await DetectLanguage(podcast.feedUrl);
		await Podcast.findByIdAndUpdate(
			podcast.id,
			{ language: podcast.language },
			{ new: true },
		);
	}
	let episodes = await Episode.find({
		podcast: podcast.id,
	})
		.sort({ publicationDate: -1 })
		.limit(1000);

	let mostRecentPublicationDate;
	if (episodes.length) {
		mostRecentPublicationDate = episodes[0].publicationDate;
	}

	let eventsData = {
		[`podcast:${podcast.id}`]: {
			articleCount: episodes.length,
			description: podcast.description,
			language: podcast.language,
			mostRecentPublicationDate: mostRecentPublicationDate,
			title: podcast.title,
		},
	};

	await events({
		meta: {
			data: eventsData,
		},
	});
}

export default sendPodcastToCollections;
