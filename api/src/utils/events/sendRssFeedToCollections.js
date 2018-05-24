import events from "./index"
import RSS from "../../models/rss"
import Article from "../../models/article"
import detectFeedLanguage from "../detectFeedLanguage"

export default rssFeedID => {
    return new Promise((resolve, reject) => {
        RSS.findById(rssFeedID)
            .then(rssFeed => {
                // first, check if language is stored on RSS feed
                if (!rssFeed.language) {
                    return detectFeedLanguage(rssFeed.feedUrl).then(language => {
                        // save to feed, return the modified document (the new: true thing)
                        return RSS.findByIdAndUpdate(rssFeedID, { language }, { new: true }).then(
                            updatedRssFeed => {
                                // return new feed
                                return updatedRssFeed
                            },
                        )
                    })
                } else {
                    return rssFeed
                }
            })
            .then(rssFeed => {
                // get number of articles for this feed, and the date for the most recently published article
                return Article.find({
                    rss: rssFeedID,
                })
                    .sort({ publicationDate: -1 })
                    .then(articles => {
                        // grab count and latest publicationDate
                        return {
                            articleCount: articles.length,
                            description: rssFeed.description,
                            language: rssFeed.language,
                            mostRecentPublicationDate: articles[0].publicationDate,
                            title: rssFeed.title,
                        }
                    })
            })
            .then(personalizationInfo => {
                return events({
                    meta: {
                        data: {
                            [`rss:${rssFeedID}`]: personalizationInfo,
                        },
                    },
                })
            })
            .then(() => {
                resolve()
            })
            .catch(err => {
                reject(err)
            })
    })
}
