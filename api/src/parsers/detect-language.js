import { ReadFeedStream, ReadFeedURL } from '../parsers/feed';
import franc from 'franc-min';

export async function DetectLanguage(feedURL) {
	let feedStream = await ReadFeedURL(feedURL);
	let posts = await ReadFeedStream(feedStream);
	console.log(posts.slice(0, 1));
}

export async function DetectLangFromStream(feedStream) {
	let posts = await ReadFeedStream(feedStream);
	let meta = posts[0].meta;
	let bestGuessLanguage = 'eng'
	// language = meta.language
  // guess the language using franc
  let languageSums = {};
	for (let post of posts.slice(0, 10)) {
		let languageVector = franc.all(`${post.title} ${post.description}`);
		for (let [language, score] of languageVector) {
      if (!(language in languageSums)) {
        languageSums[language] = 0
      }
      languageSums[language] += score
		}
	}

	// see which language has the highest score
  let languages = Object.entries(languageSums).sort((a,b) => b[1] - a[1]);
  if (languages) {
    bestGuessLanguage = languages[0][0]
  }

	return bestGuessLanguage;
}

export default feedUrl => {
	return new Promise((resolve, reject) => {
		ParseFeed(feedUrl, (err, feedContents) => {
			if (err) {
				// sometimes rss feeds throw a 503 when being added and parsed immediately - in that case, just resolve to english
				return resolve('eng');
			}
			// language in the feed metadata is only sometimes there - calculating via franc should be good enough for now
			let languageSums = {};
			for (let post of feedContents.articles) {
			}

			resolve(bestGuessLanguage);
		});
	});
};
