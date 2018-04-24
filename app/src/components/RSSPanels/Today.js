import rssIcon from '../../images/icons/rss.svg';
import React, { Component } from 'react';
import Img from 'react-image';
import PropTypes from 'prop-types';
import TimeAgo from '../TimeAgo';
import moment from 'moment';
import { Link } from 'react-router-dom';
import ExpandablePanel from '../ExpandablePanel';

class TodayRSSPanel extends Component {
	render() {
		// filter out articles that are >24h old
		let articles = this.props.articles.filter(article => {
			// 24h -> 86400000 milliseconds
			return Date.now() - moment(article.publicationDate).valueOf() < 86400000;
		});
		// if there's no articles from today, don't display panel
		if (articles.length === 0) {
			return null;
		}
		return (
			<ExpandablePanel className="today">
				<ExpandablePanel.Header>
					<span>Today</span>
					<span className="aside">{`(${articles.length})`}</span>
				</ExpandablePanel.Header>
				<ExpandablePanel.Contents>
					{articles.map((article, i) => {
						return (
							<Link
								className="panel-element"
								key={i}
								to={`/rss/${article.rss._id}/articles/${article._id}`}
							>
								<div className="left">
									<Img src={[article.rss.images.favicon, rssIcon]} />
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

TodayRSSPanel.defaultProps = {
	articles: [],
};

TodayRSSPanel.propTypes = {
	articles: PropTypes.arrayOf(PropTypes.shape({})),
};

export { TodayRSSPanel };
