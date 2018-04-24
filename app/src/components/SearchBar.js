import searchOpacityIcon from '../images/icons/search-opacity.svg';
import { Link, withRouter } from 'react-router-dom';
import Algolia from 'algoliasearch';
import Img from 'react-image';
import PropTypes from 'prop-types';
import React from 'react';
import getPlaceholderImageURL from '../util/getPlaceholderImageURL';

import config from '../config';

const client = Algolia(config.algolia.appId, config.algolia.searchKey);
const index = client.initIndex(config.algolia.index);

const getResourceUrl = resource => {
	if (resource.type === 'user') {
		return `/profile/${resource._id}`;
	} else if (resource.type === 'article') {
		return `/rss/${resource.rss}/articles/${resource._id}`;
	} else if (resource.type === 'episode') {
		return `/podcasts/${resource.podcast}`;
	} else if (resource.type === 'rss') {
		return `/rss/${resource._id}`;
	} else if (resource.type === 'podcast') {
		return `/podcasts/${resource._id}`;
	} else if (resource.type === 'playlist') {
		return `/playlists/${resource._id}`;
	} else {
		console.log(resource); // eslint-disable-line no-console
	}
};

const getResourceTitle = resource => {
	if (resource.type === 'user') {
		return resource.name;
	} else if (resource.type === 'playlist') {
		return resource.name;
	} else {
		return resource.title;
	}
};

class SearchBar extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			displayResults: false,
			query: '',
			results: [],
			selectedIndex: 0,
		};

		this.handleInputChange = this.handleInputChange.bind(this);
		this.handleKeyDown = this.handleKeyDown.bind(this);
		this.handleFormSubmit = this.handleFormSubmit.bind(this);
	}

	search(searchText) {
		index.search(
			{
				query: searchText,
			},
			(err, results) => {
				if (err) {
					console.log(err); // eslint-disable-line no-console
					return;
				}

				this.setState({
					results: results.hits.slice(0, 5),
				});
			},
		);
	}

	clearSearchResults() {
		this.hideSearchResults();

		this.setState({
			displayResults: false,
		});
	}

	hideSearchResults() {
		this.setState({
			query: '',
			results: [],
		});
	}

	handleInputChange(e) {
		this.search(e.target.value);

		let displayResults = true;
		if (e.target.value.trim() === '') {
			displayResults = false;
		}

		this.setState({
			displayResults,
			query: e.target.value,
			selectedIndex: 0,
		});
	}

	handleKeyDown(e) {
		if (e.keyCode === 40) {
			// 40 is down, 38 is up
			e.preventDefault();

			let newPos = this.state.selectedIndex + 1;
			if (newPos > 4) {
				newPos = 4;
			}

			this.setState({
				selectedIndex: newPos,
			});
		} else if (e.keyCode === 27) {
			e.preventDefault();

			this.clearSearchResults();
		} else if (e.keyCode === 38) {
			e.preventDefault();

			let newPos = this.state.selectedIndex - 1;
			if (newPos < 0) {
				newPos = 0;
			}

			this.setState({
				selectedIndex: newPos,
			});
		}
	}

	handleFormSubmit(e) {
		e.preventDefault();

		if (this.state.results.length === 0) {
			return;
		}

		this.props.history.push(
			getResourceUrl(this.state.results[this.state.selectedIndex]),
		);

		this.inputElement.blur();
		this.setState({
			displayResults: false,
		});
	}

	render() {
		let results;

		if (this.state.results.length === 0) {
			results = (
				<div className="panel-element">
					<span>No search results found...</span>
				</div>
			);
		} else {
			results = this.state.results.map((result, i) => {
				return (
					<Link
						className={`panel-element ${
							this.state.selectedIndex === i ? 'selected' : ''
						}`}
						key={result._id}
						onClick={() => {
							this.inputElement.blur();
							this.setState({
								displayResults: false,
							});
						}}
						to={getResourceUrl(result)}
					>
						<div className="left">
							<Img
								src={[result.image, getPlaceholderImageURL(result._id)]}
								width="25"
							/>
						</div>
						<div className="center">
							<span>{getResourceTitle(result)}</span>
						</div>
						<div className="right">
							<span>{result.type.toUpperCase()}</span>
						</div>
					</Link>
				);
			});
		}

		return (
			<div>
				<div
					className={`search ${
						this.props.bannerIsShown ? 'banner-is-shown' : ''
					}`}
				>
					<form onSubmit={this.handleFormSubmit}>
						<input
							autoComplete="off"
							id="search"
							onChange={this.handleInputChange}
							onFocus={() => {
								if (this.state.results.length !== 0) {
									this.setState({
										displayResults: true,
									});
								}
							}}
							onKeyDown={this.handleKeyDown}
							placeholder="Search Winds..."
							ref={element => {
								this.inputElement = element;
							}}
							type="text"
							value={this.state.query}
						/>
						<Img className="icon" src={searchOpacityIcon} />
					</form>
					{this.state.displayResults ? (
						<div>
							<div className="results panel">
								{results}
								<div className="panel-element">
									<div className="right">
										<Img
											src={'/images/logos/powered-by-algolia.svg'}
										/>
									</div>
								</div>
							</div>
						</div>
					) : null}
				</div>
				{this.state.displayResults ? (
					<div
						className="click-catcher"
						onClick={() => {
							this.inputElement.blur();
							this.setState({
								displayResults: false,
							});
						}}
					/>
				) : null}
			</div>
		);
	}
}

SearchBar.defaultProps = {
	bannerIsShown: false,
};

SearchBar.propTypes = {
	bannerIsShown: PropTypes.bool,
	history: PropTypes.shape({
		push: PropTypes.func.isRequired,
	}).isRequired,
};

export default withRouter(SearchBar);
