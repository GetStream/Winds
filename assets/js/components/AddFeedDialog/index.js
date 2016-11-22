import React, { Component } from 'react'
import ReactDOM from 'react-dom'

import Dialog from 'components/Dialog'

class AddFeedDialog extends Component {

    static defaultProps = {
        onSubmit: () => {},
        onReset: () => {},

        loading: false,
        error: false,
    }

    state = {
        url: '',
    }

    componentWillReceiveProps(props) {
        if (this.props.loading != props.loading && !props.loading) {
            this.setState({ url: '' })
        }
    }

    componentDidUpdate() {
        if (this.props.open) this.refs.url.focus()
    }

    handleChange = e => {
        this.setState({
            url: e.target.value,
        })
        this.props.onReset()
    }

    handleClick = e => {
        e.preventDefault()
        this.props.onRequestClose()
        this.props.onImport()
    }

    handleSubmit = e => {
        e.preventDefault()
        this.props.onSubmit({
            url: this.state.url,
        })
    }

    renderBtn() {

        if (this.props.error == true)
            return (
                <button
                    type="submit"
                    className="btn text-uppercase invalid-feed">
                    Feed Missing
                </button>
            )

        if (this.props.loading === true)
            return (
                <button
                    type="submit"
                    className="btn text-uppercase adding-feed">
                    Checking
                </button>
            )

        return (
            <button
                type="submit"
                className="btn text-uppercase add-feed">
                Add Feed
            </button>
        )

    }

    render() {

        return (
            <Dialog {...this.props}>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                            <div className="import-opml-option">
                                <a href="#" onClick={this.handleClick}>
                                    <svg width="16px" height="16px" viewBox="0 309 16 16">
                                        <g id="ic_file_upload_black_18px" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd" transform="translate(0.000000, 309.000000)">
                                            <g id="Group">
                                                <polygon id="Shape" points="0 0 16 0 16 16 0 16"></polygon>
                                                <path d="M6,10.6666667 L10,10.6666667 L10,6.66666667 L12.6666667,6.66666667 L8,2 L3.33333333,6.66666667 L6,6.66666667 L6,10.6666667 Z M3.33333333,12 L12.6666667,12 L12.6666667,13.3333333 L3.33333333,13.3333333 L3.33333333,12 Z" id="Shape" fill="#99A9B3"></path>
                                            </g>
                                        </g>
                                    </svg>
                                    Import OPML
                                </a>
                            </div>
                            <form onSubmit={this.handleSubmit}>
                                <div className="url-container">
                                    <input
                                        id="url-input"
                                        type="url"
                                        title="Please enter a valid site or feed URL"
                                        ref="url"
                                        className="url"
                                        placeholder="Enter a valid site or feed URL"
                                        required={true}
                                        value={this.state.url}
                                        onChange={this.handleChange} />
                                    {this.renderBtn()}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </Dialog>
        )

    }
}

require('./styles.scss')

export default AddFeedDialog
