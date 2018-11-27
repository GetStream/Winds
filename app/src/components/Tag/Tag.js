import React from 'react';
import PropTypes from 'prop-types';
import Popover from 'react-popover';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import { newTag, addTag, removeTag } from '../../api/tagAPI';
import Loader from '../Loader';

import { ReactComponent as TagIcon } from '../../images/icons/tag-simple.svg';
import { ReactComponent as AddIcon } from '../../images/icons/add-green.svg';
import { ReactComponent as XIcon } from '../../images/icons/x.svg';
import { ReactComponent as SearchIcon } from '../../images/icons/search.svg';

class Tag extends React.Component {
	constructor(props) {
		super(props);

		this.resetState = {
			menu: false,
			name: '',
			newTag: false,
			error: false,
			submittingNew: false,
			submittingAdd: '',
			submittingRemove: '',
		};

		this.state = {
			...this.resetState,
			query: '',
		};
	}

	toggleMenu = () => {
		this.setState((prevState) => ({ menu: !prevState.menu }));
	};

	resetStateTimeout = () => {
		setTimeout(() => this.setState({ ...this.resetState }), 800);
	};

	handleNewSubmit = () => {
		if (this.state.submittingNew) return;
		if (!this.state.name) return this.setState({ error: true });

		this.setState({ submittingNew: true });
		let data = { name: this.state.name };
		data[this.props.type] = [this.props.feedId];
		newTag(this.props.dispatch, data, () => this.resetStateTimeout());
	};

	handleAdd = (tagId) => {
		if (this.state.submittingAdd) return;
		this.setState({ submittingAdd: tagId });

		addTag(this.props.dispatch, tagId, this.props.feedId, this.props.type, () =>
			this.resetStateTimeout(),
		);
	};

	handleRemove = (tagId) => {
		this.setState({ submittingRemove: tagId });

		removeTag(this.props.dispatch, tagId, this.props.feedId, this.props.type, () =>
			this.resetStateTimeout(),
		);
	};

	render() {
		const query = this.state.query.toLowerCase();

		const tags = query
			? this.props.tags.filter((tag) => ~tag.name.toLowerCase().indexOf(query))
			: this.props.tags;

		const menu = (
			<div className="popover-panel tag-popover">
				{!!this.props.tags.length && (
					<div className="search-tag">
						<input
							onChange={(e) => this.setState({ query: e.target.value })}
							placeholder="Search"
							type="text"
						/>
						<SearchIcon />
					</div>
				)}

				{tags.map((tag) => (
					<div
						className="panel-element"
						key={tag._id}
						onClick={() => this.handleAdd(tag._id)}
					>
						<span>{tag.name}</span>
						{this.state.submittingAdd === tag._id && (
							<Loader defaultLoader={false} radius={20} />
						)}
					</div>
				))}

				{this.state.newTag ? (
					<div className="panel-element new-tag">
						<input
							className={
								this.state.error && !this.state.name ? 'error' : ''
							}
							onChange={(e) => this.setState({ name: e.target.value })}
							onKeyDown={(e) => e.keyCode === 13 && this.handleNewSubmit()}
							placeholder="Name"
							type="text"
						/>
						{this.state.submittingNew ? (
							<Loader defaultLoader={false} radius={20} />
						) : (
							<div className="green" onClick={this.handleNewSubmit}>
								SAVE
							</div>
						)}
					</div>
				) : (
					<div
						className="panel-element green"
						onClick={() => this.setState({ newTag: true })}
					>
						Create a new Tag
					</div>
				)}
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
						<Link to={`/tags/${tag._id}`}>{tag.name}</Link>

						{this.state.submittingRemove === tag._id ? (
							<Loader defaultLoader={false} radius={10} />
						) : (
							<XIcon
								className="clickable"
								onClick={() => this.handleRemove(tag._id)}
							/>
						)}
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
	dispatch: PropTypes.func.isRequired,
	feedId: PropTypes.string.isRequired,
	type: PropTypes.string.isRequired,
	tags: PropTypes.array,
	currentTags: PropTypes.array,
};

const mapStateToProps = (state, { feedId, type }) => {
	const currentTags = (state.tags || []).filter((tag) =>
		tag[type].find((f) => f._id === feedId),
	);

	const tags = (state.tags || []).filter(
		(tag) => !currentTags.find((f) => f._id === tag._id),
	);

	return { tags, currentTags };
};

export default connect(mapStateToProps)(Tag);
