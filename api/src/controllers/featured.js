import async from "async"

import RSS from "../models/rss"
import Podcast from "../models/podcast"

exports.list = (req, res) => {
    async.parallel(
        [
            cb => {
                RSS.find({ featured: true })
                    .lean()
                    .then(rss => {
                        let arr = []

                        rss.map(feed => {
                            feed.type = "rss"

                            arr.push(feed)
                        })

                        cb(null, arr)
                    })
                    .catch(err => {
                        cb(err)
                    })
            },
            cb => {
                Podcast.find({ featured: true })
                    .lean()
                    .then(podcasts => {
                        let arr = []

                        podcasts.map(podcast => {
                            podcast.type = "podcast"

                            arr.push(podcast)
                        })

                        cb(null, arr)
                    })
                    .catch(err => {
                        cb(err)
                    })
            },
        ],
        (err, results) => {
            if (err) {
                return res.status(404).send(err)
            }

            let shuffled = []
                .concat(results[0], results[1])
                .map(a => [Math.random(), a])
                .sort((a, b) => a[0] - b[0])
                .map(a => a[1])

            res.json(shuffled)
        },
    )
}
