import React from 'react'

var Entities = require('html-entities').AllHtmlEntities,
    entities = new Entities(),
    normalizeWhitespace = require('normalize-html-whitespace')

const normalize = (value) => {
  if (value) {
    return entities.decode(normalizeWhitespace(value))
  } else {
    return ''
  }
}

export default props => (
    <span>
        {normalize(props.children)}
    </span>
)

require('./styles.scss')
