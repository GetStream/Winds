import rssIcon from '../../images/icons/rss.svg';
import React, { Component } from 'react';
import Img from 'react-image';
import PropTypes from 'prop-types';
import TimeAgo from '../TimeAgo';
import { Link } from 'react-router-dom';
import ExpandablePanel from '../ExpandablePanel';

class EverythingRSSPanel extends Component {
	render() {
		if (this.props.articles.length === 0) {
			return null;
		}
		return (
			<ExpandablePanel className="everything">
				<ExpandablePanel.Header>
					<span>Everything</span>
					<span className="aside">{`(${this.props.articles.length}+)`}</span>
				</ExpandablePanel.Header>
				<ExpandablePanel.Contents>
					{this.props.articles.map((article, i) => {
						return (
							<Link
								className="panel-element"
								key={i}
								to={`/rss/${article.rss._id}/articles/${article._id}`}
							>
								<div className="left">
									<Img
										src={[
											article.rss.images.favicon,
											rssIcon,
										]}
									/>
								</div>
								<div className="center">{article.title}</div>
								<div className="right">
									<TimeAgo timestamp={article.publicationDate} />
								</div>
							</Link>
						);
					})}
				</ExpandablePanel.Contents>
			</ExpandablePanel>
		);
	}
}

EverythingRSSPanel.defaultProps = {
	articles: [],
};

EverythingRSSPanel.propTypes = {
	articles: PropTypes.arrayOf(PropTypes.shape({})),
};

export { EverythingRSSPanel };
