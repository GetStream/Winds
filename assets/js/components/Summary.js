import React from 'react'

var Entities = require('html-entities').AllHtmlEntities,
    entities = new Entities(),
    normalizeWhitespace = require('normalize-html-whitespace')


const truncate = (value, length = 100) => {
    if (value) {
      let text = entities.decode(normalizeWhitespace(value))

      if (text.length >= length) {
        text = text.substring(0, length) + '...'
      }
      return text
    } else{
      return ''
    }
}

export default props => (
    <p className="summary">{truncate(props.children, props.limit)}</p>
)
