import React from 'react'

var Entities = require('html-entities').AllHtmlEntities,
    entities = new Entities(),
    normalizeWhitespace = require('normalize-html-whitespace')

export default props => (
    <span>
        {entities.decode(normalizeWhitespace(props.children))}
    </span>
)

require('./styles.scss')
