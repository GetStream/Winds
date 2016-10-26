import React from 'react'

import md5 from 'md5'

export default props => {
    if (!props.children) return null
    return <img src={`https://www.gravatar.com/avatar/${md5(props.children)}`} className="img-circle" />
}
