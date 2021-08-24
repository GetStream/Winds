import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import getPlaceholderImageURL from '../util/getPlaceholderImageURL';
import { Link } from 'react-router-dom';
import { getFeatured } from '../api';

class FeaturedItems extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			featured: localStorage.getItem('featured') || 'show',
		};
	}

	componentDidMount() {
		if (!this.props.featuredItems.length) getFeatured(this.props.dispatch);
	}

	render() {
		return (
			<div className="featured-items-section">
				<div className="featured-items-header">
					<h2>Featured on Winds</h2>
					<span
						onClick={() => {
							const featured =
								this.state.featured === 'show' ? 'hide' : 'show';
							this.setState({ featured });
							localStorage.setItem('featured', featured);
						}}
					>
						{this.state.featured === 'show' ? 'Hide' : 'Show'}
					</span>
				</div>
				{this.state.featured === 'show' && (
					<div className="featured-item-list">
						{this.props.featuredItems.map((featuredItem) => {
							let linkURL = '#';
							if (featuredItem.type === 'rss') {
								linkURL = `/rss/${featuredItem._id}?featured=true`;
							} else if (featuredItem.type === 'podcast') {
								linkURL = `/podcasts/${featuredItem._id}?featured=true`;
							}
							return (
								<Link
									className="featured-item"
									key={featuredItem._id}
									style={{
										backgroundImage: `linear-gradient(0deg, #00000088 30%, #ffffff44 100%),
										url(${featuredItem.images.featured || getPlaceholderImageURL(featuredItem._id)})`,
									}}
									to={linkURL}
								>
									<h1>{featuredItem.title}</h1>
									<label>{featuredItem.type}</label>
								</Link>
							);
						})}
					</div>
				)}
			</div>
		);
	}
}

FeaturedItems.defaultProps = {
	featuredItems: [],
};

FeaturedItems.propTypes = {
	dispatch: PropTypes.func.isRequired,
	featuredItems: PropTypes.array,
};

const mapStateToProps = (state) => ({
	featuredItems: state.featuredItems || [],
});

export default connect(mapStateToProps)(FeaturedItems);
