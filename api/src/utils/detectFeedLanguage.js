import { ParseFeed } from "../workers/parsers"
import franc from "franc-min"

export default feedUrl => {
    return new Promise((resolve, reject) => {
        ParseFeed(feedUrl, (err, feedContents) => {
            if (err) {
                // sometimes rss feeds throw a 503 when being added and parsed immediately - in that case, just resolve to english
                return resolve("eng")
            }
            // language in the feed metadata is only sometimes there - calculating via franc should be good enough for now
            let languageSums = {}
            for (let post of feedContents.articles) {
                let languageVector = franc.all(`${post.title} ${post.description}`)
                for (let languageGuess of languageVector) {
                    if (languageGuess[0] in languageSums) {
                        languageSums[languageGuess[0]] += languageGuess[1]
                    } else {
                        languageSums[languageGuess[0]] = languageGuess[1]
                    }
                }
            }
            // get largest languageSum
            let max = 0
            let bestGuessLanguage = "eng"
            for (var language in languageSums) {
                if (languageSums.hasOwnProperty(language)) {
                    if (languageSums[language] > max) {
                        max = languageSums[language]
                        bestGuessLanguage = language
                    }
                }
            }
            resolve(bestGuessLanguage)
        })
    })
}
