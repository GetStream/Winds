import React, { Component } from 'react'
import ReactDOM from 'react-dom'

class Vote extends Component {

    render() {

        return (
            <div className="vote text-center">
                <div className="upvote">
                    <svg width="16px" height="9px" viewBox="2 -1 16 9">
                        <polyline id="Page-1" stroke="#99A9B3" strokeWidth="0.799999952" strokeLinecap="round" strokeLinejoin="round" fill="none" transform="translate(10.000000, 3.568966) scale(1, -1) translate(-10.000000, -3.568966) " points="16.1764706 0.793103448 9.58823529 7.13793103 6.69333509 4.34998527 3 0.793103448"></polyline>
                    </svg>
                </div>
                <div className="votes">
                    246
                </div>
                <div className="downvote">
                    <svg width="16px" height="9px" viewBox="2 30 16 9">
                        <polyline id="Page-1" stroke="#99A9B3" strokeWidth="0.799999952" strokeLinecap="round" strokeLinejoin="round" fill="none" points="16.1764706 31.6551724 9.58823529 38 3 31.6551724"></polyline>
                    </svg>
                </div>
            </div>
        )

    }

}

require('./styles.scss')

export default Vote
