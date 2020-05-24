import React from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import { Img } from 'react-image';
import { connect } from 'react-redux';

import fetch from '../util/fetch';
import { getAliases } from '../api';
import saveIcon from '../images/icons/save.svg';
import exitIcon from '../images/buttons/exit.svg';

class AliasModal extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			error: false,
			submitting: false,
			success: false,
		};
	}

	closeModal = () => {
		this.setState({ error: false, submitting: false, success: false });
		this.props.toggleModal();
	};

	handleSubmit = (e) => {
		e.preventDefault();
		const alias = new FormData(e.target).get('alias');

		const id = this.props.isRss
			? { rss: this.props.feedID }
			: { podcast: this.props.feedID };

		this.setState({ submitting: true });
		fetch('POST', '/aliases', { alias, ...id })
			.then((res) => {
				if (res.data) {
					this.setState({ success: true, submitting: false });
					getAliases(this.props.dispatch);
					setTimeout(() => this.closeModal(), 500);
				}
			})
			.catch(() => this.setState({ error: true, submitting: false }));
	};

	render() {
		let buttonText = 'SAVE';
		if (this.state.submitting) {
			buttonText = 'Submitting...';
		} else if (this.state.success) {
			buttonText = 'Success!';
		}

		return (
			<ReactModal
				className="modal add-new-content-modal"
				isOpen={this.props.isOpen}
				onRequestClose={this.closeModal}
				overlayClassName="modal-overlay"
				shouldCloseOnOverlayClick={true}
			>
				<header>
					<h1>Rename Feed</h1>
					<Img className="exit" onClick={this.closeModal} src={exitIcon} />
				</header>

				<form onSubmit={this.handleSubmit}>
					<div className="input-box">
						<input
							autoComplete="false"
							defaultValue={this.props.defVal}
							name="alias"
							placeholder="Enter new name"
							type="text"
						/>
					</div>

					{this.state.error && (
						<div className="error-message">
							Oops, something went wrong. Please try again later.
						</div>
					)}

					<div className="buttons">
						<button
							className="btn primary alt with-circular-icon"
							disabled={this.state.submitting}
							type="submit"
						>
							<Img src={saveIcon} />
							{buttonText}
						</button>

						<button
							className="btn link cancel"
							onClick={this.closeModal}
							type="cancel"
						>
							Cancel
						</button>
					</div>
				</form>
			</ReactModal>
		);
	}
}

AliasModal.defaultProps = {
	isOpen: false,
};

AliasModal.propTypes = {
	isOpen: PropTypes.bool,
	toggleModal: PropTypes.func.isRequired,
	defVal: PropTypes.string,
	isRss: PropTypes.bool,
	feedID: PropTypes.string,
	dispatch: PropTypes.func.isRequired,
};

export default connect()(AliasModal);
