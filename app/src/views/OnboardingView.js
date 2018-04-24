import doubleArrowIcon from '../images/icons/double-arrow.svg';
import partialWhiteIcon from '../images/logos/partial-white.svg';
import Img from 'react-image';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import fetch from '../util/fetch';
import onboardingTopics from '../static-data/onboarding-topics';
import { withRouter } from 'react-router';

class OnboardingView extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			selectedTopics: {},
			valid: false,
		};
		this.toggleTopic = this.toggleTopic.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.isValid = this.isValid.bind(this);
	}

	isValid() {
		let count = 0;
		for (let topic of Object.keys(this.state.selectedTopics)) {
			if (this.state.selectedTopics[topic] === true) {
				count += 1;
			}
		}
		return count >= 3;
	}

	componentDidMount() {
		this.props.getUser();

		// convert already selected props into state
		let selectedTopics = {};
		for (let topic of this.props.interests) {
			selectedTopics[topic] = true;
		}

		this.setState(
			{
				selectedTopics,
			},
			() => {
				this.setState({
					valid: this.isValid(),
				});
			},
		);
	}

	componentWillReceiveProps(nextProps) {
		let selectedTopics = {};

		for (let topic of nextProps.interests) {
			selectedTopics[topic] = true;
		}

		this.setState(
			{
				selectedTopics,
			},
			() => {
				this.setState({
					valid: this.isValid(),
				});
			},
		);
	}

	toggleTopic(topic) {
		this.setState(
			{
				selectedTopics: {
					...this.state.selectedTopics,
					[topic]: !this.state.selectedTopics[topic],
				},
				valid: this.isValid(),
			},
			() => {
				this.setState({
					valid: this.isValid(),
				});
			},
		);
	}

	handleSubmit() {
		let selectedTopics = [];

		for (let topic of Object.keys(this.state.selectedTopics)) {
			if (this.state.selectedTopics[topic] === true) {
				selectedTopics.push(topic);
			}
		}
		fetch('PUT', `/users/${localStorage['authedUser']}`, {
			interests: selectedTopics,
		})
			.then(res => {
				this.props.updateUser(res.data);
				this.props.history.push('/onboarding/2');
			})
			.catch(err => {
				console.log(err); // eslint-disable-line no-console
			});
	}

	render() {
		return (
			<div className="onboarding-view">
				<div className="hero">
					<h1>Select your interests</h1>
					<p>Select at least three interests</p>
					<button
						className="btn primary with-icon"
						disabled={!this.state.valid}
						onClick={this.handleSubmit}
					>
						<Img src={doubleArrowIcon} />
						<span>Continue</span>
					</button>
				</div>
				<div className="three-columns">
					{Object.keys(onboardingTopics).map((category, i) => {
						return (
							<div className="column" key={i}>
								<div
									className="hero-card"
									style={{
										backgroundImage: `url(${require('../images/cards/pattern-' +
											(i + 1) +
											'.png')})`,
									}}
								>
									<Img src={partialWhiteIcon} />
									<h1>{category}</h1>
								</div>
								<div className="panel with-hero-card">
									{onboardingTopics[category].map((topic, j) => {
										return (
											<div
												className="panel-element"
												key={j}
												onClick={() => {
													this.toggleTopic(topic);
												}}
											>
												<div className="center">{topic}</div>
												<div
													className={`right clickable ${
														this.state.selectedTopics[
															topic
														] === true
															? 'active'
															: ''
													}`}
												>
													{this.state.selectedTopics[topic] ===
													true
														? 'Selected'
														: 'Select'}
												</div>
											</div>
										);
									})}
								</div>
							</div>
						);
					})}
				</div>
			</div>
		);
	}
}

OnboardingView.defaultProps = { interests: [] };

OnboardingView.propTypes = {
	getUser: PropTypes.func.isRequired,
	history: PropTypes.shape({
		push: PropTypes.func.isRequired,
	}),
	interests: PropTypes.arrayOf(PropTypes.string),
	updateUser: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
	return { interests: state.users[localStorage['authedUser']].interests };
};

const mapDispatchToProps = dispatch => {
	return {
		getUser: () => {
			fetch('GET', `/users/${localStorage['authedUser']}`).then(res => {
				dispatch({ type: 'UPDATE_USER', user: res.data });
			});
		},
		updateUser: user => {
			dispatch({ type: 'UPDATE_USER', user });
		},
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(OnboardingView));
