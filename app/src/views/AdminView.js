import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import fetch from '../util/fetch';
import onboardingTopics from '../static-data/onboarding-topics';
import { Link } from 'react-router-dom';

function compareTitles(lhs, rhs) {
	return lhs.title.localeCompare(rhs.title, undefined, { sensitivity: 'accent' });
}

class AdminView extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			userID: props.userID,
			emailHTML: 'No content',
			emailType: 'daily',
			podcasts: [],
			rssFeeds: [],
		};
	}

	componentDidMount() {
		this.getRssFeeds();
		this.getPodcasts();
	}

	getRssFeeds() {
		fetch('get', '/rss').then((res) => {
			this.setState({ rssFeeds: res.data.sort(compareTitles) });
		});
	}

	getPodcasts() {
		fetch('get', '/podcasts').then((res) => {
			this.setState({ podcasts: res.data.sort(compareTitles) });
		});
	}

	render() {
		return (
			<div className="admin">
				<h1>Admin View</h1>
				<input
					className="toggle"
					id="collapsible-podcast"
					type="checkbox"
					value=""
				/>
				<label className="lbl-toggle" htmlFor="collapsible-podcast">
					<h2>Podcasts</h2>
				</label>
				<div className="collapsible-content">
					<table className="table">
						<thead>
							<tr>
								<th>Feed URL</th>
								<th>Title</th>
								<th>Featured (new users automatically follow)</th>
								<th>Featured image</th>
								<th>
									Interest (users that select this interest will
									automatically follow)
								</th>
								<th>Description</th>
								<th>Summary</th>
								<th>Link</th>
							</tr>
						</thead>
						<tbody>
							{this.state.podcasts.map((podcast) => {
								return (
									<PodcastRow
										{...podcast}
										getPodcasts={() => this.getPodcasts()}
										key={podcast._id}
									/>
								);
							})}
						</tbody>
					</table>
				</div>
				<input className="toggle" id="collapsible-rss" type="checkbox" value="" />
				<label className="lbl-toggle" htmlFor="collapsible-rss">
					<h2>RSS Feeds</h2>
				</label>
				<div className="collapsible-content">
					<table className="table">
						<thead>
							<tr>
								<th>Feed URL</th>
								<th>Title</th>
								<th>Featured (new users automatically follow)</th>
								<th>Featured image</th>
								<th>
									Interest (users that select this interest will
									automatically follow)
								</th>
								<th>Description</th>
								<th>Summary</th>
								<th>Link</th>
							</tr>
						</thead>
						<tbody>
							{this.state.rssFeeds.map((rssFeed) => {
								return (
									<RssRow
										key={rssFeed._id}
										{...rssFeed}
										getRssFeeds={() => this.getRssFeeds()}
									/>
								);
							})}
						</tbody>
					</table>
				</div>
				<input
					className="toggle"
					id="collapsible-email"
					type="checkbox"
					value=""
				/>
				<label className="lbl-toggle" htmlFor="collapsible-email">
					<h2>Test email</h2>
				</label>
				<div className="collapsible-content">
					<form
						onSubmit={(event) => {
							this.setState({ emailHTML: 'Loading' });
							fetch(
								'get',
								`/email/${this.state.emailType}?user=${this.state.userID}`,
							).then((res) => {
								this.setState({ emailHTML: res.data });
							});
							event.preventDefault();
						}}
					>
						<label>
							User ID:&nbsp;
							<input
								name="user_id"
								onChange={(event) => {
									this.setState({ userID: event.target.value });
								}}
								value={this.state.userID}
							/>
						</label>
						&nbsp;
						<select
							onChange={(event) => {
								this.setState({
									emailHTML: 'No content',
									emailType: event.target.value,
								});
							}}
							value={this.state.emailType}
						>
							<option value="daily">Daily digest</option>
							<option value="weekly">Weekly digest</option>
						</select>
						&nbsp;
						<input type="submit" value="Preview" />
						&nbsp;
						<input
							onClick={() => {
								fetch(
									'post',
									`/email/${this.state.emailType}?user=${this.state.userID}`,
								);
							}}
							type="button"
							value="Send"
						/>
					</form>
					<div
						className="email"
						dangerouslySetInnerHTML={{ __html: this.state.emailHTML }}
					/>
				</div>
			</div>
		);
	}
}

class PodcastRow extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			changed: false,
			descriptionText: props.description,
			featuredImageText: props.images.featured,
			summaryText: props.summary,
		};
	}

	render() {
		return (
			<tr>
				<td>{this.props.feedUrl}</td>
				<td>{this.props.title}</td>
				<td>
					<input
						checked={this.props.featured}
						onChange={() => {
							fetch('put', `/podcasts/${this.props._id}`, {
								featured: !this.props.featured,
							}).then(() => this.props.getPodcasts());
						}}
						type="checkbox"
					/>
				</td>
				<td>
					<input
						onChange={(e) => {
							this.setState({
								changed: true,
								featuredImageText: e.target.value,
							});
						}}
						value={this.state.featuredImageText}
					/>
					{this.state.featuredImageText !== this.props.images.featured ? (
						<button
							onClick={() => {
								fetch('put', `/podcasts/${this.props._id}`, {
									images: {
										...this.props.images,
										featured: this.state.featuredImageText,
									},
								}).then(() => this.props.getPodcasts());
							}}
						>
							save
						</button>
					) : null}
				</td>
				<td>
					<select
						onChange={(e) => {
							let interest = e.target.value;
							if (e.target.value === 'none') {
								interest = '';
							}
							fetch('put', `/podcasts/${this.props._id}`, {
								interest,
							}).then(() => this.props.getPodcasts());
						}}
						value={this.props.interest}
					>
						<option value="none">None</option>
						{onboardingTopics.map((interest) => {
							return (
								<option key={interest.name} value={interest.name}>
									{interest.name}
								</option>
							);
						})}
					</select>
				</td>
				<td>
					<input
						onChange={(e) => {
							this.setState({
								changed: true,
								descriptionText: e.target.value,
							});
						}}
						value={this.state.descriptionText}
					/>
					{this.state.descriptionText !== this.props.description ? (
						<button
							onClick={() => {
								fetch('put', `/podcasts/${this.props._id}`, {
									description: this.state.descriptionText,
								}).then(() => this.props.getPodcasts());
							}}
						>
							save
						</button>
					) : null}
				</td>
				<td>
					<input
						onChange={(e) => {
							this.setState({
								changed: true,
								summaryText: e.target.value,
							});
						}}
						value={this.state.summaryText}
					/>
					{this.state.summaryText !== this.props.summary ? (
						<button
							onClick={() => {
								fetch('put', `/podcasts/${this.props._id}`, {
									summary: this.state.summaryText,
								}).then(() => this.props.getPodcasts());
							}}
						>
							save
						</button>
					) : null}
				</td>
				<td>
					<Link to={`/podcasts/${this.props._id}`}>go to podcast</Link>
				</td>
			</tr>
		);
	}
}

PodcastRow.propTypes = {
	_id: PropTypes.string.isRequired,
	description: PropTypes.string,
	featured: PropTypes.bool,
	feedUrl: PropTypes.string,
	getPodcasts: PropTypes.func.isRequired,
	images: PropTypes.shape({
		featured: PropTypes.string,
	}),
	interest: PropTypes.string,
	summary: PropTypes.string,
	title: PropTypes.string,
};

class RssRow extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			changed: false,
			descriptionText: props.description,
			featuredImageText: props.images.featured,
			summaryText: props.summary,
		};
	}

	render() {
		return (
			<tr>
				<td>{this.props.feedUrl}</td>
				<td>{this.props.title}</td>
				<td>
					<input
						checked={this.props.featured}
						onChange={() => {
							fetch('put', `/rss/${this.props._id}`, {
								featured: !this.props.featured,
							}).then(() => {
								this.props.getRssFeeds();
							});
						}}
						type="checkbox"
					/>
				</td>
				<td>
					<input
						onChange={(e) => {
							this.setState({
								changed: true,
								featuredImageText: e.target.value,
							});
						}}
						value={this.state.featuredImageText}
					/>
					{this.state.featuredImageText !== this.props.images.featured ? (
						<button
							onClick={() => {
								fetch('put', `/rss/${this.props._id}`, {
									images: {
										...this.props.images,
										featured: this.state.featuredImageText,
									},
								}).then(() => {
									this.props.getRssFeeds();
								});
							}}
						>
							save
						</button>
					) : null}
				</td>
				<td>
					<select
						onChange={(e) => {
							let interest = e.target.value;
							if (e.target.value === 'none') {
								interest = '';
							}
							fetch('put', `/rss/${this.props._id}`, {
								interest,
							}).then(() => {
								this.props.getRssFeeds();
							});
						}}
						value={this.props.interest}
					>
						<option value="none">None</option>
						{onboardingTopics.map((interest) => {
							return (
								<option key={interest.name} value={interest.name}>
									{interest.name}
								</option>
							);
						})}
					</select>
				</td>
				<td>
					<input
						onChange={(e) => {
							this.setState({
								changed: true,
								descriptionText: e.target.value,
							});
						}}
						value={this.state.descriptionText}
					/>
					{this.state.descriptionText !== this.props.description ? (
						<button
							onClick={() => {
								fetch('put', `/rss/${this.props._id}`, {
									description: this.state.descriptionText,
								}).then(() => {
									this.props.getRssFeeds();
								});
							}}
						>
							save
						</button>
					) : null}
				</td>
				<td>
					<input
						onChange={(e) => {
							this.setState({
								changed: true,
								summaryText: e.target.value,
							});
						}}
						type="text"
						value={this.state.summaryText}
					/>
					{this.state.summaryText !== this.props.summary ? (
						<button
							onClick={() => {
								fetch('put', `/rss/${this.props._id}`, {
									summary: this.state.summaryText,
								}).then(() => {
									this.props.getRssFeeds();
								});
							}}
						>
							save
						</button>
					) : null}
				</td>
				<td>
					<Link to={`/rss/${this.props._id}`}>go to rss feed</Link>
				</td>
			</tr>
		);
	}
}

RssRow.propTypes = {
	_id: PropTypes.string.isRequired,
	description: PropTypes.string,
	featured: PropTypes.bool,
	feedUrl: PropTypes.string,
	getRssFeeds: PropTypes.func.isRequired,
	images: PropTypes.shape({
		featured: PropTypes.string,
	}),
	interest: PropTypes.string,
	summary: PropTypes.string,
	title: PropTypes.string,
};

RssRow.defaultProps = {
	description: '',
	summary: '',
};

const mapStateToProps = (state) => {
	const userID = localStorage['authedUser'];

	if (!userID) {
		return null;
	}

	return { userID, ...state };
};

AdminView.propTypes = {
	userID: PropTypes.string,
};

export default connect(mapStateToProps)(AdminView);
