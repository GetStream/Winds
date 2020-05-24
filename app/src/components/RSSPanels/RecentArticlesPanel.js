import { Link } from 'react-router-dom';
import getPlaceholderImageURL from '../../util/getPlaceholderImageURL';
import { Img } from 'react-image';
import React from 'react';
import Panel from '../Panel';
import { connect } from 'react-redux';
import TimeAgo from '../TimeAgo';
import PropTypes from 'prop-types';
import { getFeed } from '../../util/feeds';

class RecentArticlesPanel extends React.Component {
	componentDidMount() {
		if (!this.props.articles.length) getFeed(this.props.dispatch, 'article', 0, 20);
	}

	render() {
		return (
			<Panel expandable={true} headerLink="/rss" headerText="Recent Articles">
				{this.props.articles.slice(0, 20).map((article) => {
					return (
						<Link
							key={article._id}
							to={`/rss/${article.rss._id}/articles/${article._id}`}
						>
							<Img
								loader={<div className="placeholder" />}
								src={[
									article.favicon,
									getPlaceholderImageURL(article._id),
								]}
							/>
							<div>{article.title}</div>
							<TimeAgo
								className="muted"
								timestamp={article.publicationDate}
								trim={true}
							/>
						</Link>
					);
				})}
			</Panel>
		);
	}
}

RecentArticlesPanel.defaultProps = {
	articles: [],
};

RecentArticlesPanel.propTypes = {
	articles: PropTypes.arrayOf(PropTypes.shape({})),
	dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
	articles:
		state.articles && state.feeds && state.feeds.article
			? state.feeds.article.map((id) => state.articles[id])
			: [],
});

export default connect(mapStateToProps)(RecentArticlesPanel);
