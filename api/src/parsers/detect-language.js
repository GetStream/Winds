import { ReadFeedStream, ReadFeedURL } from '../parsers/feed';
import franc from 'franc-min';

// DetectLanguage returns the language for the given feed url
export async function DetectLanguage(feedURL) {
	let feedStream = await ReadFeedURL(feedURL);
	let language = await DetectLangFromStream(feedStream);
	return language;
}

// DetectLangFromStream returns the language for the given feed stream
export async function DetectLangFromStream(feedStream) {
	let posts = await ReadFeedStream(feedStream);

	let bestGuessLanguage = 'eng';
	if (!posts || !posts.length) {
		return bestGuessLanguage;
	}

	let meta = posts[0].meta;
	// language = meta.language
	// guess the language using franc
	let languageSums = {};
	for (let post of posts.slice(0, 10)) {
		let languageVector = franc.all(`${post.title} ${post.description}`);
		for (let [language, score] of languageVector) {
			if (!(language in languageSums)) {
				languageSums[language] = 0;
			}
			languageSums[language] += score;
		}
	}

	// see which language has the highest score
	let languages = Object.entries(languageSums).sort((a, b) => b[1] - a[1]);
	if (languages) {
		bestGuessLanguage = languages[0][0];
	}

	return bestGuessLanguage;
}
