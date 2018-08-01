import searchOpacityIcon from '../images/icons/search-opacity.svg';
import algoliaLogo from '../images/logos/powered-by-algolia.svg';
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
	switch (resource.type) {
	case 'user':
		return `/profile/${resource._id}`;
	case 'article':
		return `/rss/${resource.rss}/articles/${resource._id}`;
	case 'episode':
		return `/podcasts/${resource.podcast}`;
	case 'rss':
		return `/rss/${resource.duplicateOf || resource._id}`;
	case 'podcast':
		return `/podcasts/${resource._id}`;
	case 'playlist':
		return `/playlists/${resource._id}`;
	default:
		console.log(resource); // eslint-disable-line no-console
	}
};

const getResourceTitle = resource => {
	switch (resource.type) {
	case 'user':
	case 'playlist':
		return resource.name;
	default:
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
					if (window.console) {
						console.log(err); // eslint-disable-line no-console
					}

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
			<React.Fragment>
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
						<div className="results panel">
							{results}
							<div className="panel-element">
								<div className="right">
									<Img className="algolia-logo" src={algoliaLogo} />
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
			</React.Fragment>
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
