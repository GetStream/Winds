import Img from 'react-image';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import React from 'react';
import getPlaceholderImageURL from '../util/getPlaceholderImageURL';

class PodcastSuggestion extends React.Component {
	render() {
		let reason = '';
		if (this.props.reasonEnum === 'shared') {
			reason = 'Based on podcasts you shared';
		} else if (this.props.reasonEnum === 'listened') {
			reason = 'Based on podcasts you listened to';
		} else if (this.props.reasonEnum === 'followed') {
			reason = 'Based on podcasts you followed';
		}
		let statsString = '';
		if (this.props.likes.length === 1) {
			statsString = (
				<span>
					{'Liked by '}
					<strong>{this.props.likes[0]}</strong>
				</span>
			);
		} else if (this.props.likes.length === 2) {
			statsString = (
				<span>
					{'Liked by '}
					<strong>{this.props.likes[0]}</strong>
					{' and '}
					<strong>
						{this.props.likes.length - 1}
						{' other'}
					</strong>
				</span>
			);
		} else if (this.props.likes.length > 2) {
			statsString = (
				<span>
					{'Liked by '}
					<strong>{this.props.likes[0]}</strong>
					{' and '}
					<strong>
						{this.props.likes.length - 1}
						{' others'}
					</strong>
				</span>
			);
		}

		return (
			<Link className="suggestion" to={`/podcasts/${this.props.podcastID}`}>
				<div className="left">
					<Img
						height="70"
						src={[
							this.props.image,
							getPlaceholderImageURL(this.props.podcastID),
						]}
						width="70"
					/>
				</div>
				<div className="right">
					<p className="title">{this.props.title}</p>
					<p className="stats">
						liked by a <strong>bunch</strong> of people
					</p>
					<p className="stats">{statsString}</p>
					<p className="why">{'recommended because you\'re awesome'}</p>
					<p className="why">{reason}</p>
				</div>
				<div className="chevron">
					<i aria-hidden="true" className="fa fa-chevron-right" />
				</div>
			</Link>
		);
	}
}

PodcastSuggestion.defaultProps = {
	likes: [],
	reasonEnum: null,
};

PodcastSuggestion.propTypes = {
	image: PropTypes.string,
	likes: PropTypes.array,
	podcastID: PropTypes.string.isRequired,
	reasonEnum: PropTypes.string,
	title: PropTypes.string.isRequired,
};

export default PodcastSuggestion;
