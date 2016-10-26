import React, { Component } from 'react'
import { connect } from 'react-redux'

import * as FeedActions from 'actions/Feeds'

@connect()
class Footer extends Component {

    render() {
        return (
            <footer>
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-lg-9 col-md-9 col-sm-9 col-xs-9 text-left">
                            <em>
                                RSS Reader was built by <a href="https://getstream.io" target="_blank">Stream</a>
                                &nbsp;|&nbsp;
                                Powered with <a href="https://getstream.io/docs_analytics/#introductionp" target="_blank">Personalization</a>
                                &nbsp;|&nbsp;
                                100% Open Source on <a href="https://github.com/GetStream/stream-sails-rss-personalization" target="_blank">Github</a>
                            </em>
                        </div>
                        <div className="col-lg-3 col-md-3 col-sm-3 col-xs-3 text-right">
                            <a href="https://www.facebook.com/getstream.io/" target="_blank"><i className="fa fa-facebook"></i></a>
                            <a href="https://github.com/getstream" target="_blank"><i className="fa fa-github"></i></a>
                            <a href="https://twitter.com/getstream_io" target="_blank"><i className="fa fa-twitter"></i></a>
                        </div>
                    </div>
                </div>
            </footer>
        )
    }
}

require('./styles.scss')

export default Footer
