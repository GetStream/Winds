import events from "./index"
import Podcast from "../../models/podcast"
import Episode from "../../models/episode"
import detectPodcastLanguage from "../detectPodcastLanguage"

export default podcastID => {
    return new Promise((resolve, reject) => {
        Podcast.findById(podcastID)
            .then(podcast => {
                // first, check if language is stored on podcast
                if (!podcast.language) {
                    return detectPodcastLanguage(podcast.feedUrl).then(language => {
                        // save to podcast, return the modified document (the new: true thing)
                        return Podcast.findByIdAndUpdate(
                            podcastID,
                            { language },
                            { new: true },
                        ).then(updatedPodcast => {
                            // return new podcast
                            return updatedPodcast
                        })
                    })
                } else {
                    return podcast
                }
            })
            .then(podcast => {
                // get number of episodes for this podcast, and the date for the most recently published episode
                return Episode.find({
                    podcast: podcastID,
                })
                    .sort({ publicationDate: -1 })
                    .then(episodes => {
                        // grab count and latest publicationDate
                        return {
                            articleCount: episodes.length,
                            description: podcast.description,
                            language: podcast.language,
                            mostRecentPublicationDate: episodes[0].publicationDate,
                            title: podcast.title,
                        }
                    })
            })
            .then(personalizationInfo => {
                return events({
                    meta: {
                        data: {
                            [`podcast:${podcastID}`]: personalizationInfo,
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
