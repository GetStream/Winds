import React from 'react';
import PropTypes from 'prop-types';
import Algolia from 'algoliasearch';
import { Img } from 'react-image';
import { connect } from 'react-redux';

import config from '../../config';
import getPlaceholderImageURL from '../../util/getPlaceholderImageURL';
import { ReactComponent as SearchOpacityIcon } from '../../images/icons/search-opacity.svg';
import { ReactComponent as AlgoliaLogo } from '../../images/logos/powered-by-algolia.svg';

const client = Algolia(config.algolia.appId, config.algolia.searchKey);
const index = client.initIndex(config.algolia.index);

class SearchFeed extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			displayResults: false,
			query: '',
			results: [],
			selectedIndex: 0,
		};

		this.inputElement = React.createRef();
	}

	search = (query) => {
		index.search({ query }, (err, result) => {
			if (err) return console.log(err); // eslint-disable-line no-console

			const followed = this.props.followedFeeds;
			const hits = result.hits
				.sort((a, b) => (followed[a._id] ? (followed[b._id] ? 0 : -1) : 1))
				.filter((r) => !this.props.folders[r._id]);

			this.setState({ results: hits.slice(0, 8) });
		});
	};

	handleInputChange = (e) => {
		this.setState({
			displayResults: !!e.target.value.trim(),
			query: e.target.value,
			selectedIndex: 0,
		});

		this.search(e.target.value);
	};

	handleKeyDown = (e) => {
		if (e.keyCode === 27) {
			e.preventDefault();
			if (this.state.query) e.stopPropagation();

			this.setState({ query: '', results: [], displayResults: false });
		} else if (e.keyCode === 40) {
			e.preventDefault();
			let newPos = this.state.selectedIndex + 1;
			if (newPos > 4) newPos = 4;

			this.setState({ selectedIndex: newPos });
		} else if (e.keyCode === 38) {
			e.preventDefault();
			let newPos = this.state.selectedIndex - 1;
			if (newPos < 0) newPos = 0;

			this.setState({ selectedIndex: newPos });
		} else if (e.keyCode === 13) {
			e.preventDefault();
			if (!this.state.results.length) return;

			this.props.addFeed(this.state.results[this.state.selectedIndex]);
			this.inputElement.current.blur();
			this.setState({ displayResults: false });
		}
	};

	render() {
		return (
			<div className="search-feed">
				<div className="input-box">
					<input
						autoComplete="off"
						id="search"
						onChange={this.handleInputChange}
						onFocus={() => {
							if (!!this.state.results.length !== 0)
								this.setState({ displayResults: true });
						}}
						onKeyDown={this.handleKeyDown}
						placeholder="Search Winds Feeds..."
						ref={this.inputElement}
						type="text"
						value={this.state.query}
					/>
					<SearchOpacityIcon className="icon" />
				</div>

				{this.state.displayResults && (
					<>
						<div
							className="click-catcher"
							onClick={() => this.setState({ displayResults: false })}
						/>
						<div className="results panel">
							{this.state.results.length ? (
								this.state.results.map((result, i) => (
									<div
										className={`panel-element ${
											this.state.selectedIndex === i && 'selected'
										}`}
										key={result._id}
										onClick={() => {
											this.props.addFeed(result);
											this.inputElement.current.blur();
											this.setState({ displayResults: false });
										}}
									>
										<div className="left">
											<Img
												src={getPlaceholderImageURL(result._id)}
												width="25"
											/>
										</div>
										<div className="center">{result.title}</div>
										<div className="right type">
											{result.type.toUpperCase()}
										</div>
									</div>
								))
							) : (
								<div className="panel-element">
									No search results found...
								</div>
							)}

							<div className="panel-element">
								<div className="right">
									<AlgoliaLogo className="algolia-logo" />
								</div>
							</div>
						</div>
					</>
				)}
			</div>
		);
	}
}

SearchFeed.propTypes = {
	addFeed: PropTypes.func,
	folders: PropTypes.shape({}),
	followedFeeds: PropTypes.shape({}),
};

const mapStateToProps = (state) => ({
	folders: (state.folders || []).reduce((acc, f) => {
		f.rss.map((r) => (acc[r._id] = true));
		f.podcast.map((p) => (acc[p._id] = true));
		return acc;
	}, {}),
	followedFeeds: {
		...(state.followedRssFeeds || {}),
		...(state.followedPodcasts || {}),
	},
});

export default connect(mapStateToProps)(SearchFeed);
