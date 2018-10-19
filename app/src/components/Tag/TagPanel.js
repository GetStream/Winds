import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router-dom';

import Panel from '../Panel';

import { ReactComponent as TagIcon } from '../../images/icons/tag.svg';
import { ReactComponent as TagIconHighlight } from '../../images/icons/tag-opacity.svg';

class TagPanel extends React.Component {
	render() {
		const tagID = this.props.match.params.tagID;

		return (
			<Panel
				className="tag-panel"
				fragmentChild={true}
				hasHighlight={!!tagID}
				headerText="Tags"
			>
				{this.props.tags.length ? (
					this.props.tags.map((tag) => (
						<Link
							className={tagID === tag._id ? 'highlighted' : ''}
							key={tag._id}
							to={`/tags/${tag._id}`}
						>
							{tagID === tag._id ? <TagIcon /> : <TagIconHighlight />}
							<div>{tag.name}</div>
							<div>
								<i className="fa fa-chevron-right" />
							</div>
						</Link>
					))
				) : (
					<div className="no-content">
						<TagIcon />
						<span>No Tags yet</span>
					</div>
				)}
			</Panel>
		);
	}
}

TagPanel.defaultProps = {
	tags: [],
};

TagPanel.propTypes = {
	tags: PropTypes.arrayOf(PropTypes.shape({})),
	match: PropTypes.shape({
		params: PropTypes.shape({
			tagID: PropTypes.string,
		}),
	}),
};

const mapStateToProps = (state) => ({ tags: [] || state.tags || [] });

export default withRouter(connect(mapStateToProps)(TagPanel));
