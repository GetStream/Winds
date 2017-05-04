import React from 'react'

var Entities = require('html-entities').AllHtmlEntities,
    entities = new Entities(),
    normalizeWhitespace = require('normalize-html-whitespace')

const truncate = (value, length = 15) => {
    if (value) {
      let text = entities.decode(normalizeWhitespace(value))
      if (text.length < length) return text
      else return text.substring(0, length) + '...'
    } else{
      return ''
    }
}

export default props => (
    <span>{truncate(props.children, props.limit)}</span>
)
