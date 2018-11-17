import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

class Panel extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			expanded: false,
		};
	}
	render() {
		let children;

		if (Array.isArray(this.props.children)) {
			children = this.props.children.map((child, i) => {
				let { className, ...restProps } = child.props;

				return (
					<child.type
						className={`panel-element ${className}`}
						key={i}
						{...restProps}
					/>
				);
			});
		} else {
			let { className, ...restProps } = this.props.children.props;
			children = (
				<this.props.children.type
					className={`panel-element ${className}`}
					{...restProps}
				/>
			);
		}

		if (
			this.props.expandable &&
			!this.state.expanded &&
			Array.isArray(this.props.children)
		) {
			children = children.slice(0, this.props.expandSize);
		}

		return (
			<div
				className={`panel ${
					this.props.expandable && this.state.expanded ? 'expanded' : ''
				} ${this.props.hasHighlight ? 'hasHighlight' : ''}`}
			>
				{this.props.headerLink ? (
					<Link className="panel-header" to={this.props.headerLink}>
						{this.props.headerText}
					</Link>
				) : (
					<div className="panel-header">{this.props.headerText}</div>
				)}

				<div className="panel-contents">
					{children}
					{this.props.expandable && (
						<div
							className="expander"
							onClick={() => {
								this.setState({
									expanded: !this.state.expanded,
								});
							}}
						>
							<i
								className={`fa fa-chevron-${
									this.props.expandable && this.state.expanded
										? 'up'
										: 'down'
								}`}
							/>
						</div>
					)}
				</div>
			</div>
		);
	}
}

Panel.defaultProps = {
	expandable: false,
	expandSize: 3,
};

Panel.propTypes = {
	children: PropTypes.oneOfType([
		PropTypes.element,
		PropTypes.arrayOf(PropTypes.element),
	]),
	expandable: PropTypes.bool,
	hasHighlight: PropTypes.bool,
	headerLink: PropTypes.string,
	headerText: PropTypes.string,
	expandSize: PropTypes.number,
};

export default Panel;
