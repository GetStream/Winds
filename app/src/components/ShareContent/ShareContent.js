import exitIcon from '../images/buttons/exit.svg';
import React, { Component } from 'react';
import Img from 'react-image';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import { connect } from 'react-redux';

class PresentationalShareContent extends Component {
	constructor(props) {
		super(props);

		this.state = {
			shareContentModalIsOpen: false,
		};
	}

	render() {
		return (
			<ReactModal
				className="add-new-content"
				isOpen={this.props.shareContentModalIsOpen}
				overlayClassName="modal-overlay"
				shouldCloseOnOverlayClick={true}
			>
				<header>
					<h1>Share</h1>
					<div className="exit">
						<Img src={exitIcon} />
					</div>
				</header>
			</ReactModal>
		);
	}
}

PresentationalShareContent.defaultProps = {
	shareContentModalIsOpen: false,
};

PresentationalShareContent.propTypes = {
	shareContentModalIsOpen: PropTypes.bool,
};

const mapStateToProps = state => {
	return { jwt: state.user.jwt };
};

const AddNewContent = connect(mapStateToProps)(PresentationalShareContent);

export default AddNewContent;
