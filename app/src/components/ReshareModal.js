import md5 from 'md5';
import Img from 'react-image';
import NewShareForm from './NewShareForm';
import PropTypes from 'prop-types';
import React from 'react';
import ReactModal from 'react-modal';
import { connect } from 'react-redux';
import { getActivity } from '../selectors';
import MediaCard from './MediaCard';

ReactModal.setAppElement('#root');

class ReshareModal extends React.Component {
	render() {
		return (
			<ReactModal
				className="modal reshare-modal"
				isOpen={this.props.reshareModalIsOpen}
				onRequestClose={this.props.toggleModal}
				overlayClassName="modal-overlay"
				shouldCloseOnEsc={true}
				shouldCloseOnOverlayClick={true}
			>
				<header>
					<Img
						className="exit"
						onClick={this.props.toggleModal}
						src="/images/buttons/exit.svg"
					/>
				</header>
				<MediaCard
					author={this.props.activity.user.name}
					image={`https://www.gravatar.com/avatar/${md5(
						this.props.activity.user.email,
					)}?s=200`}
					link={`/profile/${this.props.activity.user._id}`}
					title={this.props.activity.text}
					type="share"
				/>
				<NewShareForm
					onComplete={this.props.toggleModal}
					share={this.props.activity}
					userEmail={this.props.authedUserEmail}
					userID={this.props.authedUserID}
				/>
			</ReactModal>
		);
	}
}

ReshareModal.defaultProps = {
	reshareModalIsOpen: false,
};

ReshareModal.propTypes = {
	activity: PropTypes.shape({
		text: PropTypes.string,
		user: PropTypes.shape({
			_id: PropTypes.string,
			email: PropTypes.string,
			name: PropTypes.string,
		}),
	}),
	authedUserEmail: PropTypes.string.isRequired,
	authedUserID: PropTypes.string.isRequired,
	reshareModalIsOpen: PropTypes.bool,
	toggleModal: PropTypes.func.isRequired,
};

const mapStateToProps = (state, ownProps) => {
	let activity = getActivity(state, `share:${ownProps.forActivityID}`);
	return { ...ownProps, activity };
};

export default connect(mapStateToProps)(ReshareModal);
