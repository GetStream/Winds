import React, { Component } from 'react'
import ReactDOM from 'react-dom'

import * as axios from 'axios'

import Dialog from 'components/Dialog'

class ImportOPMLDialog extends Component {

    static defaultProps = {
        onSubmit: () => {},
    }

    state = {
        error: false,
        success: false,
        loading: false,
    }

    handleSubmit = (e) => {

        e.preventDefault()

        let reader = new FileReader(),
            file   = e.target.files[0],
            data   = new FormData()

        data.append('opml', file)

        this.setState({ loading: true, })

        axios.post('/api/uploads/opml', data, {
            headers: {
                Authorization: `JWT ${localStorage.getItem('token')}`,
                'x-csrf-token': window.csrf,
            },
        }).then(res => {

            this.setState({ success: true, })
            this.renderBtn()

            setTimeout(() => window.location.reload(), 2500)

        }).catch(err => {

            this.setState({ error: true, })
            this.renderBtn()

            setTimeout(() => {
                this.setState({ error: false, loading: false, })
                this.renderBtn()
            }, 5000)

        })

    }

    handleChange = (e) => {
        e.preventDefault()
        this.handleSubmit(e)
    }

    handleFileClick = (e) => {
        document.getElementById('file').click()
    }

    renderBtn() {

        if (this.state.error)
            return (
                <button
                    type="submit"
                    className="btn text-uppercase invalid-opml">
                    Invalid OPML
                </button>
            )

        if (this.state.loading)
            return (
                <button
                    type="submit"
                    className="btn text-uppercase parsing-opml">
                    Importing
                </button>
            )

        if (this.state.success)
            return (
                <button
                    type="submit"
                    className="btn text-uppercase imported-opml">
                    Success
                </button>
            )

        return (
            <button
                type="submit"
                className="btn text-uppercase import-opml"
                onClick={this.handleFileClick}>
                Import Now
            </button>
        )

    }

    render() {

        return (
            <Dialog {...this.props}>
                <div className="container import-opml-dialog">
                    <div className="row">
                        <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12 text-center">
                            <div className="logo">
                                <svg width="30px" height="31px" viewBox="600 145 30 31">
                                    <g id="winds-app-logo" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd" transform="translate(602.000000, 146.000000)" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20.9708,4.0005 C21.0506,2.5514 19.8784,0.1129 16.9708,0.0005 C16.9367,-0.0008 16.9026,0.0008 16.8689,0.0038 C11.2231,0.503 12.1909,8.0361 16.9708,8.0005 C23.2379,7.9538 26.9708,8.0005 26.9708,8.0005" id="Stroke-1" stroke="#16C98D" strokeWidth="2"></path>
                                        <path d="M7.9708,10.0005 C8.0506,8.5514 6.8784,6.1129 3.9708,6.0005 C3.9367,5.9992 3.9026,6.0008 3.8689,6.0038 C-1.7769,6.503 -0.8091,14.0361 3.9708,14.0005 C10.2379,13.9538 26.9708,14.0005 26.9708,14.0005" id="Stroke-2" stroke="#16C98D" strokeWidth="2"></path>
                                        <path d="M12.9708,24.0001 C13.0506,25.4492 11.8784,27.8877 8.9708,28.0001 C8.9367,28.0015 8.9026,27.9998 8.8689,27.9968 C3.2231,27.4976 4.1909,19.9646 8.9708,20.0001 C15.2379,20.0468 26.9708,20.0001 26.9708,20.0001" id="Stroke-3" stroke="#16C98D" strokeWidth="2"></path>
                                    </g>
                                </svg>
                            </div>
                            <p>Import your OPML file into Winds</p>
                            <form encType="multipart/form-data" onSubmit={() => this.handleSubmit}>
                                <input
                                    id="file"
                                    type="file"
                                    ref="file"
                                    accept=".opml"
                                    onChange={(e) => this.handleChange(e)}
                                    required={true} />
                                {this.renderBtn()}
                            </form>
                        </div>
                    </div>
                </div>
            </Dialog>
        )

    }
}

require('./styles.scss')

export default ImportOPMLDialog
