import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router-dom';

import Panel from '../Panel';
import { ReactComponent as FolderLogo } from '../../images/icons/folder.svg';

class FolderList extends React.Component {
	render() {
		return (
			<Panel headerText="Folders">
				{this.props.folders.map((folder) => {
					return (
						<Link key={folder._id} to={`/folders/${folder._id}`}>
							<FolderLogo />
							<div>{folder.name}</div>
							<div>
								<i className="fa fa-chevron-right" />
							</div>
						</Link>
					);
				})}
			</Panel>
		);
	}
}

FolderList.propTypes = {
	folders: PropTypes.arrayOf(PropTypes.shape({})),
};

FolderList.defaultProps = {
	folders: [],
};

const mapStateToProps = (state) => ({
	folders: state.folders || [],
});

export default connect(mapStateToProps)(withRouter(FolderList));
