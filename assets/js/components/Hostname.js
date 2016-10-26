import React from 'react'

function getHost(url) {
    const a = document.createElement('a')
    a.href = url
    return a.host
}

export default props => <span>{getHost(props.children)}</span>
