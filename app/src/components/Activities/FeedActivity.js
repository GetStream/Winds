import PropTypes from 'prop-types';
import React from 'react';
import { UserShare } from '../Activities';
import EpisodeActivityItem from '../EpisodeActivityItem';
import ArticleActivityItem from '../ArticleActivityItem';

class FeedActivity extends React.Component {
	render() {
		if (this.props.type === 'share') {
			return <UserShare {...this.props} />;
		} else if (this.props.type === 'episode') {
			return <EpisodeActivityItem {...this.props} />;
		} else if (this.props.type === 'article') {
			return <ArticleActivityItem {...this.props} />;
		} else {
			return null;
		}
	}
}

FeedActivity.propTypes = {
	type: PropTypes.string.isRequired,
};

export default FeedActivity;
