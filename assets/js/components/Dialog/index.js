import React, { Component } from 'react'

import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

const FirstChild = props => {
    const children = React.Children.toArray(props.children)
    return children[0] || null
}

class Dialog extends Component {

    static defaultProps = {
        onRequestClose: () => {},
    }

    render() {

        let classes = ['dialog']
        if (this.props.open) classes.push('open')

        return (
            <div className={classes.join(' ')}>
                <div className="dialog-modal" onClick={this.props.onRequestClose} />
                <div className="dialog-close" onClick={this.props.onRequestClose}>
                    <svg width="14px" height="14px" viewBox="48 58 14 14" version="1.1">
                        <polygon id="Shape" stroke="none" fill="black" fillRule="evenodd" points="62 59.41 60.59 58 55 63.59 49.41 58 48 59.41 53.59 65 48 70.59 49.41 72 55 66.41 60.59 72 62 70.59 56.41 65"></polygon>
                    </svg>
                </div>
                <ReactCSSTransitionGroup
                    transitionName="dialog"
                    component={FirstChild}
                    transitionEnterTimeout={250}
                    transitionLeaveTimeout={250}>
                    {this.props.open
                        ? <div key={`dialog`} className="content">{this.props.children}</div>
                        : null}
                </ReactCSSTransitionGroup>
            </div>
        )
    }
}

require('./styles.scss')

export default Dialog
