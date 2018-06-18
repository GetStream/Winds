import events from './index';
import RSS from '../../models/rss';
import Article from '../../models/article';
import {DetectLanguage} from '../../parsers/detect-language';


async function sendRssFeedToCollections(rssFeed) {
	if (!rssFeed.language) {
		rssFeed.language = await DetectLanguage(rssFeed.feedUrl);
		await RSS.findByIdAndUpdate(rssFeed.id, { language: rssFeed.language }, { new: true });
	}

	let articles = await Article.find({
		rss: rssFeed.id,
	}).sort({ publicationDate: -1 }).limit(1000);
	let mostRecentPublicationDate
	if (articles.length) {
		mostRecentPublicationDate = articles[0].publicationDate
	}

	await events({
		meta: {
			data: {
				[`rss:${rssFeed.id}`]: {
					articleCount: articles.length,
					description: rssFeed.description,
					language: rssFeed.language,
					mostRecentPublicationDate: mostRecentPublicationDate,
					title: rssFeed.title,
				},
			},
		},
	});
}

export default sendRssFeedToCollections;
