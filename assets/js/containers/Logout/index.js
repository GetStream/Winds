import { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'

import * as UserActions from 'actions/User'

class LogoutPage extends Component {

  componentWillMount() {
    localStorage.clear()
    this.props.dispatch(UserActions.logout())
    window.location.href = '/api/logout'
  }

  render() {
    return null
  }
}
LogoutPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  router: PropTypes.object.isRequired
}

export default connect()(withRouter(LogoutPage))
