import React from 'react';
import PropTypes from 'prop-types';

class Tabs extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			selectedTab: parseInt(localStorage[this.props.tabGroup], 10) || 0,
		};
	}
	render() {
		let selectedElement = this.props.children[this.state.selectedTab];
		// clever key deletion with es7 destructuring
		let { tabTitle, ...selectedElementProps } = selectedElement.props; // eslint-disable-line no-unused-vars
		return (
			<div>
				<ul className="tabs">
					{this.props.children.map((element, i) => {
						return (
							<li
								className={`tab ${
									this.state.selectedTab === i ? 'active' : ''
								}`}
								key={i}
								onClick={() => {
									localStorage[this.props.tabGroup] = i;
									this.setState({
										selectedTab: i,
									});
								}}
							>
								{element.props.tabTitle}
							</li>
						);
					})}
				</ul>
				<div>
					<selectedElement.type {...selectedElementProps} />
				</div>
			</div>
		);
	}
}
Tabs.propTypes = {
	children: PropTypes.arrayOf(PropTypes.element),
	tabGroup: PropTypes.string.isRequired,
};

export default Tabs;
