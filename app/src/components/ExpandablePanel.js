import React from 'react';
import PropTypes from 'prop-types';

class ExpandablePanel extends React.Component {
	render() {
		return (
			<div className={`panel ${this.props.className}`}>{this.props.children}</div>
		);
	}
}

ExpandablePanel.propTypes = {
	children: PropTypes.arrayOf(PropTypes.element),
	className: PropTypes.string,
};

class Header extends React.Component {
	render() {
		return <div className="panel-header">{this.props.children}</div>;
	}
}

Header.propTypes = {
	children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.object]),
};

class Contents extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			expanded: false,
		};
		this.toggleExpanded = this.toggleExpanded.bind(this);
	}
	toggleExpanded() {
		this.setState({
			expanded: !this.state.expanded,
		});
	}

	render() {
		let shownArticles;
		if (this.state.expanded) {
			shownArticles = this.props.children;
		} else {
			shownArticles = this.props.children.slice(0, 3);
		}

		let showExpander = true;
		if (this.props.children.length <= 3) {
			showExpander = false;
		}

		return (
			<div>
				{shownArticles}
				{showExpander ? (
					<div className="panel-expander" onClick={this.toggleExpanded}>
						<i
							className={`fas fa-chevron-${
								this.state.expanded ? 'up' : 'down'
							}`}
						/>
					</div>
				) : null}
			</div>
		);
	}
}

Contents.defaultProps = {
	children: [],
};

Contents.propTypes = {
	children: PropTypes.arrayOf(PropTypes.element),
};

ExpandablePanel.Header = Header;
ExpandablePanel.Contents = Contents;

export { ExpandablePanel as default };
