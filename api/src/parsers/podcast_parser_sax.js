const _ = require("lodash")
const sax = require("sax")

// forked from https://raw.githubusercontent.com/akupila/node-podcast-parser/master/src/index.js

module.exports = function parse(feedXML, callback) {
    const parser = sax.parser({
        strict: true,
        lowercase: true,
    })

    // -----------------------------------------------------

    const result = {
        categories: [],
    }
    var node = null

    var tmpEpisode

    parser.onopentag = function(nextNode) {
        node = {
            name: nextNode.name,
            attributes: nextNode.attributes,
            parent: node,
        }

        if (!node.parent) {
            return
        }

        if (node.name === "channel") {
            // root channel
            node.target = result
            node.textMap = {
                title: true,
                link: true,
                language: text => {
                    var lang = text
                    if (!/\w\w-\w\w/i.test(text)) {
                        if (lang === "en") {
                            // sloppy language does not conform to ISO 639
                            lang = "en-us"
                        } else {
                            // de-de etc
                            lang = `${lang}-${lang}`
                        }
                    }
                    return { language: lang.toLowerCase() }
                },
                "itunes:subtitle": "description.short",
                description: "description.long",
                ttl: text => {
                    return { ttl: parseInt(text) }
                },
                pubDate: text => {
                    return { updated: new Date(text) }
                },
                "itunes:explicit": isExplicit,
            }
        } else if (node.name === "itunes:image" && node.parent.name === "channel") {
            result.image = node.attributes.href
        } else if (node.name === "itunes:owner" && node.parent.name === "channel") {
            result.owner = node.target = {}
            node.textMap = {
                "itunes:name": "name",
                "itunes:email": "email",
            }
        } else if (node.name === "itunes:category") {
            const path = [node.attributes.text]
            var tmp = node.parent
            // go up to fill in parent categories
            while (tmp && tmp.name === "itunes:category") {
                path.unshift(tmp.attributes.text)
                tmp = tmp.parent
            }

            const lastCategoryIndex = result.categories.length - 1
            if (result.categories[lastCategoryIndex] === path[0]) {
                // overwrite last category because this one is more specific
                result.categories[lastCategoryIndex] = path.join(">")
            } else {
                result.categories.push(path.join(">"))
            }
        } else if (node.name === "item" && node.parent.name === "channel") {
            // New item
            tmpEpisode = {}
            node.target = tmpEpisode
            node.textMap = {
                title: true,
                guid: true,
                link: true,
                "itunes:summary": "description.primary",
                description: "description.alternate",
                pubDate: text => {
                    return { published: new Date(text) }
                },
                "itunes:duration": text => {
                    return {
                        // parse '1:03:13' into 3793 seconds
                        duration: text
                            .split(":")
                            .reverse()
                            .reduce((acc, val, index) => {
                                const steps = [60, 60, 24]
                                var muliplier = 1
                                while (index--) {
                                    muliplier *= steps[index]
                                }
                                return acc + parseInt(val) * muliplier
                            }, 0),
                    }
                },
                "itunes:explicit": isExplicit,
            }
        } else if (tmpEpisode) {
            // Episode specific attributes
            if (node.name === "itunes:image") {
                // episode image
                tmpEpisode.image = node.attributes.href
            } else if (node.name === "enclosure") {
                tmpEpisode.enclosure = {
                    filesize: node.attributes.length ? parseInt(node.attributes.length) : undefined,
                    type: node.attributes.type,
                    url: node.attributes.url,
                }
            }
        }
    }

    parser.onclosetag = function(name) {
        node = node.parent

        if (tmpEpisode && name === "item") {
            if (!result.episodes) {
                result.episodes = []
            }
            // coalesce descriptions (no breaking change)
            let description = ""
            if (tmpEpisode.description) {
                description = tmpEpisode.description.primary
                if (
                    !description ||
                    (tmpEpisode.description.alternate &&
                        tmpEpisode.description.alternate.length > description.length)
                ) {
                    description = tmpEpisode.description.alternate
                }
                description = description || ""
            }
            tmpEpisode.description = description
            result.episodes.push(tmpEpisode)
            tmpEpisode = null
        }
    }

    parser.ontext = parser.oncdata = function handleText(text) {
        text = text.trim()
        if (text.length === 0) {
            return
        }

        /* istanbul ignore if */
        if (!node || !node.parent) {
            // This should never happen but it's here as a safety net
            // I guess this might happen if a feed was incorrectly formatted
            return
        }

        if (node.parent.textMap) {
            const key = node.parent.textMap[node.name]
            if (key) {
                if (typeof key === "function") {
                    // value preprocessor
                    Object.assign(node.parent.target, key(text))
                } else {
                    const keyName = key === true ? node.name : key
                    const prevValue = node.parent.target[keyName]
                    // ontext can fire multiple times, if so append to previous value
                    // this happens with "text &amp; other text"
                    _.set(node.parent.target, keyName, prevValue ? `${prevValue} ${text}` : text)
                }
            }
        }

        if (tmpEpisode && node.name === "category") {
            if (!tmpEpisode.categories) {
                tmpEpisode.categories = []
            }
            tmpEpisode.categories.push(text)
        }
    }

    parser.onend = function() {
        // sort by date descending
        if (result.episodes) {
            result.episodes = result.episodes.sort((item1, item2) => {
                return item2.published.getTime() - item1.published.getTime()
            })
        }

        if (!result.updated) {
            if (result.episodes && result.episodes.length > 0) {
                result.updated = result.episodes[0].published
            } else {
                result.updated = null
            }
        }

        result.categories = _.uniq(result.categories)

        callback(null, result)
    }

    // Annoyingly sax also emits an error
    // https://github.com/isaacs/sax-js/pull/115
    try {
        parser.write(feedXML).close()
    } catch (error) {
        callback(error)
    }
}

function isExplicit(text) {
    return {
        explicit: (text || "").toLowerCase() === "yes",
    }
}
