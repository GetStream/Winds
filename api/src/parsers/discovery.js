import logger from '../utils/logger';
import rssFinder from 'rss-finder';

// small wrapper around rssFinder that helps out with some common sites
export async function discoverRSS(url) {

	let foundRSS = await rssFinder(url)

  return foundRSS
}
