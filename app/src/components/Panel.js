import React from 'react';
import PropTypes from 'prop-types';

class Panel extends React.Component {
	render() {
		return <div className="panel">{this.props.children}</div>;
	}
}

Panel.propTypes = {
	children: PropTypes.oneOfType([
		PropTypes.element,
		PropTypes.arrayOf(PropTypes.element),
	]),
};

class PanelHeader extends React.Component {
	render() {
		return <div className="panel-header">{this.props.children}</div>;
	}
}
PanelHeader.propTypes = {
	children: PropTypes.oneOfType([
		PropTypes.element,
		PropTypes.node,
		PropTypes.arrayOf(PropTypes.element),
	]),
};

class PanelContents extends React.Component {
	render() {
		return (
			<div className="panel-contents">
				{Array.isArray(this.props.children) ? (
					this.props.children.map((child, i) => {
						return (
							<child.type
								className="panel-element"
								key={i}
								{...child.props}
							/>
						);
					})
				) : (
					<this.props.children.type
						className="panel-element"
						{...this.props.children.props}
					/>
				)}
			</div>
		);
	}
}

PanelContents.propTypes = {
	children: PropTypes.oneOfType([
		PropTypes.element,
		PropTypes.arrayOf(PropTypes.element),
	]),
};

Panel.Header = PanelHeader;
Panel.Contents = PanelContents;

export default Panel;
