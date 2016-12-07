import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'

import * as LikeActions from 'actions/Likes'

@connect(state => ({ likes: state.Likes }))
class Like extends Component {

    state = {
        liked: false,
    }

    componentWillMount() {
        this.props.dispatch(LikeActions.load(this.props.id))
            .then(res => {
                if (res.response && this.props.id === res.response.feedId) {
                    this.setState({ liked: true, })
                }
            })
    }

    handleClick = (e) => {
        if (!this.state.liked) {
            this.setState({ liked: true, })
            this.props.dispatch(LikeActions.like(this.props.id))
        } else {
            this.setState({ liked: false, })
            this.props.dispatch(LikeActions.unlike(this.props.id))
        }
    }

    render () {

        if (this.state.liked) {

            return (
                <span className="like">
                    <svg width="16px" height="16px" viewBox="3 247 16 16" onClick={this.handleClick}>
                        <g id="ic_favorite_black_18px-(1)" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd" transform="translate(3.000000, 247.000000)">
                            <g id="Group">
                                <polygon id="Shape" points="0 0 16 0 16 16 0 16"></polygon>
                                <path d="M8,14.2333333 L7.03333333,13.3533333 C3.6,10.24 1.33333333,8.18666667 1.33333333,5.66666667 C1.33333333,3.61333333 2.94666667,2 5,2 C6.16,2 7.27333333,2.54 8,3.39333333 C8.72666667,2.54 9.84,2 11,2 C13.0533333,2 14.6666667,3.61333333 14.6666667,5.66666667 C14.6666667,8.18666667 12.4,10.24 8.96666667,13.36 L8,14.2333333 Z" id="Shape" fill="#99A9B3"></path>
                            </g>
                        </g>
                    </svg>
                </span>
            )

        } else {

            return (
                <span className="like">
                    <svg width="16px" height="16px" viewBox="1 377 16 16" onClick={this.handleClick}>
                        <g id="ic_favorite_border_black_18px" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd" transform="translate(1.000000, 377.000000)">
                            <g id="Group">
                                <polygon id="Shape" points="0 0 16 0 16 16 0 16"></polygon>
                                <path d="M11,2 C9.84,2 8.72666667,2.54 8,3.39333333 C7.27333333,2.54 6.16,2 5,2 C2.94666667,2 1.33333333,3.61333333 1.33333333,5.66666667 C1.33333333,8.18666667 3.6,10.24 7.03333333,13.36 L8,14.2333333 L8.96666667,13.3533333 C12.4,10.24 14.6666667,8.18666667 14.6666667,5.66666667 C14.6666667,3.61333333 13.0533333,2 11,2 Z M8.06666667,12.3666667 L8,12.4333333 L7.93333333,12.3666667 C4.76,9.49333333 2.66666667,7.59333333 2.66666667,5.66666667 C2.66666667,4.33333333 3.66666667,3.33333333 5,3.33333333 C6.02666667,3.33333333 7.02666667,3.99333333 7.38,4.90666667 L8.62666667,4.90666667 C8.97333333,3.99333333 9.97333333,3.33333333 11,3.33333333 C12.3333333,3.33333333 13.3333333,4.33333333 13.3333333,5.66666667 C13.3333333,7.59333333 11.24,9.49333333 8.06666667,12.3666667 Z" id="Shape" fill="#99A9B3"></path>
                            </g>
                        </g>
                    </svg>
                </span>
            )

        }

    }

}

require('./styles.scss')

export default Like
