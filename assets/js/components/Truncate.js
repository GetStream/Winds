import React from 'react'

var Entities = require('html-entities').AllHtmlEntities,
    entities = new Entities(),
    normalizeWhitespace = require('normalize-html-whitespace')

const truncate = (text, length = 15) => {
    if (text.length < length) return text
    return text.substring(0, length) + '...'
}

export default props => (
    <span>
        {truncate(entities.decode(normalizeWhitespace(props.children)), props.limit)}
    </span>
)
