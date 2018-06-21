import config from '../config';
import util from 'util'

// makes it easy to change urls in the future
const urlMap = {
    'article_detail': 'rss/%s/articles/%s',
    'rss_detail': 'rss/%s',
    'podcast_detail': 'podcast/%s',
}

export function getUrl(urlName, ...args) {

    const format = urlMap[urlName]
    const path = util.format(format, ...args)
    const url = config.url + '/' + path
    return url
}
