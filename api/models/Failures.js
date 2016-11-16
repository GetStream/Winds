
/*
* Simple log to track when things break with adding feeds
*/
module.exports = {
    attributes: {
        url: {
            type: 'text'
        },
        user: {
            model: 'users',
        },
    }
};
