import searchOpacityIcon from '../images/icons/search-opacity.svg';
import algoliaLogo from '../images/logos/powered-by-algolia.svg';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Algolia from 'algoliasearch';
import { Img } from 'react-image';
import PropTypes from 'prop-types';
import React from 'react';
import getPlaceholderImageURL from '../util/getPlaceholderImageURL';

import config from '../config';

const client = Algolia(config.algolia.appId, config.algolia.searchKey);
const index = client.initIndex(config.algolia.index);

const getResourceUrl = (resource) => {
	switch (resource.type) {
		case 'folder':
			return `/folders/${resource._id}`;
		case 'article':
			return `/rss/${resource.rss}/articles/${resource._id}`;
		case 'episode':
			return `/podcasts/${resource.podcast}`;
		case 'rss':
			return `/rss/${resource.duplicateOf || resource._id}`;
		case 'podcast':
			return `/podcasts/${resource._id}`;
		case 'tag':
			return `/tags/${resource._id}`;
		default:
			console.log(resource); // eslint-disable-line no-console
	}
};

const getResourceTitle = (resource) => {
	switch (resource.type) {
		case 'folder':
		case 'tag':
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
	}

	search = (searchText) => {
		index.search({ query: searchText }, (err, result) => {
			if (err) return console.log(err); // eslint-disable-line no-console

			const folders = this.props.folders.filter((folder) =>
				folder.name.toLowerCase().includes(searchText.toLowerCase()),
			);
			const tags = this.props.tags.filter((tag) =>
				tag.name.toLowerCase().includes(searchText.toLowerCase()),
			);
			const followed = this.props.followedFeeds;
			const hits = result.hits.sort((a, b) =>
				followed[a._id] ? (followed[b._id] ? 0 : -1) : 1,
			);

			this.setState({ results: [...folders, ...tags, ...hits].slice(0, 8) });
		});
	};

	clearSearchResults = () => {
		this.hideSearchResults();
		this.setState({ displayResults: false });
	};

	hideSearchResults = () => {
		this.setState({ query: '', results: [] });
	};

	handleInputChange = (e) => {
		this.search(e.target.value);

		this.setState({
			displayResults: e.target.value.trim() !== '',
			query: e.target.value,
			selectedIndex: 0,
		});
	};

	handleKeyDown = (e) => {
		if (e.keyCode === 40) {
			// 40 is down, 38 is up
			e.preventDefault();

			let newPos = this.state.selectedIndex + 1;
			if (newPos > 4) newPos = 4;

			this.setState({ selectedIndex: newPos });
		} else if (e.keyCode === 27) {
			e.preventDefault();

			this.clearSearchResults();
		} else if (e.keyCode === 38) {
			e.preventDefault();

			let newPos = this.state.selectedIndex - 1;
			if (newPos < 0) newPos = 0;

			this.setState({ selectedIndex: newPos });
		}
	};

	handleFormSubmit = (e) => {
		e.preventDefault();

		if (!this.state.results.length) return;

		this.props.history.push(
			getResourceUrl(this.state.results[this.state.selectedIndex]),
		);

		this.inputElement.blur();
		this.setState({ displayResults: false });
	};

	render() {
		let results;
		// console.log(this.props.tags);

		if (!this.state.results.length) {
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
							this.setState({ displayResults: false });
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
						<div className="right type">
							<span>{result.type.toUpperCase()}</span>
						</div>
					</Link>
				);
			});
		}

		return (
			<>
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
								if (this.state.results.length !== 0)
									this.setState({ displayResults: true });
							}}
							onKeyDown={this.handleKeyDown}
							placeholder="Search Winds..."
							ref={(element) => {
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
				{this.state.displayResults && (
					<div
						className="click-catcher"
						onClick={() => {
							this.inputElement.blur();
							this.setState({ displayResults: false });
						}}
					/>
				)}
			</>
		);
	}
}

SearchBar.defaultProps = {
	bannerIsShown: false,
};

SearchBar.propTypes = {
	folders: PropTypes.array,
	tags: PropTypes.array,
	followedFeeds: PropTypes.shape({}),
	bannerIsShown: PropTypes.bool,
	history: PropTypes.shape({
		push: PropTypes.func.isRequired,
	}).isRequired,
};

const mapStateToProps = (state) => ({
	folders: (state.folders || []).map((folder) => ({ ...folder, type: 'folder' })),
	tags: (state.tags || []).map((tag) => ({ ...tag, type: 'tag' })),
	followedFeeds: {
		...(state.followedRssFeeds || {}),
		...(state.followedPodcasts || {}),
	},
});

export default connect(mapStateToProps)(withRouter(SearchBar));
