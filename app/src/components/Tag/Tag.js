import React from 'react';
import PropTypes from 'prop-types';
import Popover from 'react-popover';
import { connect } from 'react-redux';

import { ReactComponent as TagIcon } from '../../images/icons/tag-simple.svg';
import { ReactComponent as AddIcon } from '../../images/icons/add-green.svg';
import { ReactComponent as XIcon } from '../../images/icons/x.svg';

class Tag extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			menu: false,
		};
	}

	toggleMenu = () => {
		this.setState((prevState) => ({ menu: !prevState.menu }));
	};

	render() {
		const menu = (
			<div className="popover-panel">
				{this.props.tags.map((tag) => (
					<div
						className="panel-element menu-item"
						key={tag._id}
						onClick={this.toggleMenu}
					>
						{tag.name}
					</div>
				))}
			</div>
		);

		return (
			<React.Fragment>
				<TagIcon />
				<Popover
					body={menu}
					isOpen={this.state.menu}
					onOuterAction={this.toggleMenu}
					preferPlace="below"
					tipSize={0.1}
				>
					<AddIcon className="clickable" onClick={this.toggleMenu} />
				</Popover>
				{this.props.currentTags.map((tag) => (
					<span className="tag-item" key={tag._id}>
						{tag.name}
						<XIcon
							className="clickable"
							onClick={() => console.log(tag._id)}
						/>
					</span>
				))}
			</React.Fragment>
		);
	}
}

Tag.defaultProps = {
	tags: [],
	currentTags: [],
};

Tag.propTypes = {
	feedId: PropTypes.string.isRequired,
	type: PropTypes.string.isRequired,
	tags: PropTypes.array,
	currentTags: PropTypes.array,
};

const mapStateToProps = (state, { feedId, type }) => ({
	tags: state.tags || [],
	currentTags: (state.tags || []).filter((tag) =>
		tag[type].find((f) => f._id === feedId),
	),
});

export default connect(mapStateToProps)(Tag);
