import rssIcon from '../../images/icons/rss.svg';
import pinIcon from '../../images/icons/pin.svg';
import React, { Component } from 'react';
import Img from 'react-image';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import TimeAgo from '../TimeAgo';
import ExpandablePanel from '../ExpandablePanel';

class PinsRSSPanel extends Component {
	render() {
		if (this.props.pins.length === 0) {
			return null;
		} else {
			return (
				<ExpandablePanel className="pins">
					<ExpandablePanel.Header>
						<span>Pins</span>
					</ExpandablePanel.Header>
					<ExpandablePanel.Contents>
						{this.props.pins.map((pin, i) => {
							return (
								<Link
									className="panel-element"
									key={i}
									to={`/rss/${pin.article.rss._id}/articles/${
										pin.article._id
									}`}
								>
									<div className="left">
										<Img src={[pin.article.rss.images.favicon, rssIcon]} />
									</div>
									<div className="center">{pin.article.title}</div>
									<div
										className="right"
										onClick={e => {
											e.preventDefault();
											e.stopPropagation();
											this.props.unpinArticle(
												pin._id,
												pin.article._id,
											);
										}}
									>
										<TimeAgo
											timestamp={pin.article.publicationDate}
										/>
										<Img className="pin" src={pinIcon} />
									</div>
								</Link>
							);
						})}
					</ExpandablePanel.Contents>
				</ExpandablePanel>
			);
		}
	}
}

PinsRSSPanel.propTypes = {
	pins: PropTypes.arrayOf(
		PropTypes.shape({
			article: PropTypes.shape({
				title: PropTypes.string,
			}),
		}),
	),
	unpinArticle: PropTypes.func.isRequired,
};

PinsRSSPanel.defaultProps = {
	pins: [],
};

export { PinsRSSPanel };
