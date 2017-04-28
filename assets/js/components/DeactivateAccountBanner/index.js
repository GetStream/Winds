import React, { Component } from 'react'
import { connect } from 'react-redux'

import * as UserActions from 'actions/User'

@connect()
class DeactivateAccountBanner extends Component {
    state = {
        confirmed: false,
    }

    handleDeactivation = (e) => {

        e.preventDefault()

        localStorage.clear()
        this.props.dispatch(UserActions.deactivate())
    }

    render () {
        if (this.state.confirmed) {
            return (
            <div className="banner confirmed">
                Are you sure you want to delete your account?
                <a href="#" onClick={this.handleDeactivation}>Yes</a>
                &nbsp;<span className="pipe">&#124;</span>&nbsp;
                <a href="#" onClick={() => this.setState({ confirmed: false, })}>No</a>
            </div>
            )
        } else {
            return (
                <div className="banner">
                    <a href="#" onClick={() => this.setState({ confirmed: true, })}>Permanently delete your account?</a>
                </div>
            )
        }
    }
}

require('./styles.scss')

export default DeactivateAccountBanner