import events from './index';
import RSS from '../../models/rss';
import Article from '../../models/article';
import detectFeedLanguage from '../detectFeedLanguage';


async function sendRssFeedToCollections(rssFeed) {
	if (!rssFeed.language) {
		rssFeed.language = await detectFeedLanguage(rssFeed.feedUrl);
		await RSS.findByIdAndUpdate(rssFeed.id, { [language]: rssFeed.language }, { new: true });
	}

	let personalizationInfo = await Article.find({
		rss: rssFeed.id,
	}).sort({ publicationDate: -1 }).limit(1000).then(articles => {
		// grab count and latest publicationDate
		return {
			articleCount: articles.length,
			description: rssFeed.description,
			language: rssFeed.language,
			mostRecentPublicationDate: articles[0].publicationDate,
			title: rssFeed.title,
		};
	});

	await events({
		meta: {
			data: {
				[`rss:${rssFeed.id}`]: personalizationInfo,
			},
		},
	});
}

export default sendRssFeedToCollections;

