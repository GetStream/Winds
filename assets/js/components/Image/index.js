import React, { Component } from 'react'

import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

class ImageComponent extends Component {

    static defaultProps = {
        src: null,
        placeholder: 'http://i.imgur.com/GPfS63U.png',
    }

    state = {
        loading: true,
        image: null,
    }

    handleLoad = () => {
        if (this.i.width <= 10 || this.i.height <= 10) return
        this.setState({ image: this.i, loading: false, })
    }

    load = () => {
        if (!this.props.src) this.setState({ loading: true, })

        this.setState({ loading: true, })
        this.i = new Image()
        this.i.addEventListener('load', this.handleLoad, false)
        this.i.src = this.props.src
    }

    componentWillMount() {
        this.load()
    }

    componentWillUnmount() {
        this.i.removeEventListener('load', this.handleLoad, false)
    }

    componentWillReceiveProps(props) {
        if (this.props.src != props.src) {
            this.load()
        }
    }

    render() {
        let classes = ['image']
        if (this.props.className) classes = [
            ...classes,
            ...this.props.className.split(' ')
        ]

        const {
            className,
            src,
            placeholder,
            ...props
        } = this.props

        return (
            <ReactCSSTransitionGroup
                component="div"
                className={classes.join(' ')}
                transitionName="image"
                {...props}
                transitionEnterTimeout={300}
                transitionLeaveTimeout={300}>
            {!this.state.loading && this.state.image
                ? <div className="inner-image" style={{ backgroundImage: `url("${this.state.image.src}")`}} key="image" />
                : <div className="inner-image" style={{ backgroundImage: `url("${this.props.placeholder})"`}} key="placeholder" />}
            </ReactCSSTransitionGroup>
        )
    }
}

require('./styles.scss')

export default ImageComponent
