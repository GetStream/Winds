import PropTypes from 'prop-types';
import React from 'react';
import { Waypoint } from 'react-waypoint';
import { connect } from 'react-redux';

import ArticleListItem from '../ArticleListItem';
import EpisodeListItem from '../EpisodeListItem';
import Loader from '../Loader';
import { getFolderFeeds } from '../../api/folderAPI';

import { ReactComponent as LoaderIcon } from '../../images/loaders/default.svg';

class FolderFeeds extends React.Component {
	constructor(props) {
		super(props);

		this.resetState = {
			loading: true,
			error: false,
			page: 0,
			newFeeds: false,
			reachedEndOfFeed: false,
			feeds: [],
		};

		this.state = { ...this.resetState };
	}

	componentDidMount() {
		if (this.props.folder._id) {
			this.setState({ ...this.resetState }, () =>
				this.getFeeds(this.props.folder._id),
			);
			this.subscribeToStreamFeed(
				this.props.folder._id,
				this.props.folder.streamToken,
			);
		}
	}

	componentDidUpdate(prevProps) {
		if (
			prevProps.folder._id !== this.props.folder._id ||
			prevProps.sortBy !== this.props.sortBy
		) {
			this.setState({ ...this.resetState }, () =>
				this.getFeeds(this.props.folder._id),
			);
			this.subscribeToStreamFeed(
				this.props.folder._id,
				this.props.folder.streamToken,
			);
		}
	}

	subscribeToStreamFeed(folderID, streamToken) {
		this.unsubscribeFromStreamFeed();
		this.subscription = window.streamClient
			.feed('folder', folderID, streamToken)
			.subscribe(() => this.setState({ newFeeds: true }));
	}

	unsubscribeFromStreamFeed() {
		if (this.subscription) this.subscription.cancel();
	}

	getFeeds = (folderID, newFeed = false) => {
		this.setState({ loading: true, error: false });

		const params = {
			page: newFeed ? 0 : this.state.page,
			per_page: 10,
			sort_by: this.props.sortBy,
		};

		getFolderFeeds(folderID, params)
			.then(({ data }) => {
				this.setState({ loading: false, error: false });
				if (data.length === 0) this.setState({ reachedEndOfFeed: true });
				else
					this.setState(({ feeds }) => ({
						feeds: newFeed ? data : [...feeds, ...data],
					}));
			})
			.catch((err) => {
				this.setState({ loading: false, error: true });
				console.log(err); // eslint-disable-line no-console
			});
	};

	render() {
		const folder = this.props.folder;
		const feeds = this.state.feeds.map((feed) => {
			if (feed.type === 'articles')
				feed.pinID = this.props.pinnedArticles[feed._id]
					? this.props.pinnedArticles[feed._id]._id
					: '';
			else
				feed.pinID = this.props.pinnedEpisodes[feed._id]
					? this.props.pinnedEpisodes[feed._id]._id
					: '';

			return feed;
		});

		if (this.state.loading && !feeds.length) return <Loader />;

		return (
			<div className="list content">
				{this.state.newFeeds && (
					<div
						className="toast"
						onClick={() => {
							this.getFeeds(folder._id, true);
							this.setState({ newFeeds: false });
						}}
					>
						New Feeds Available – Click to Refresh
					</div>
				)}

				{this.state.error && (
					<div className="end">
						<p>Something went wrong! please try again.</p>
					</div>
				)}

				{!this.state.error && !feeds.length && (
					<div className="end">
						<p>We haven&#39;t found any feeds for this Folder yet :(</p>
					</div>
				)}

				{!!feeds.length && (
					<>
						{feeds.map((feed) =>
							feed.type === 'articles' ? (
								<ArticleListItem key={feed._id} {...feed} />
							) : (
								<EpisodeListItem key={feed._id} {...feed} />
							),
						)}

						{this.state.reachedEndOfFeed ? (
							<div className="end">
								<p>That&#39;s it! No more feeds here.</p>
								<p>
									What, did you think that once you got all the way
									around, you&#39;d just be back at the same place that
									you started? Sounds like some real round-feed thinking
									to me.
								</p>
							</div>
						) : (
							<div>
								<Waypoint
									onEnter={() =>
										this.setState(
											(prevState) => ({
												page: prevState.page + 1,
											}),
											() => this.getFeeds(folder._id),
										)
									}
								/>
								<div className="end-loader">
									<LoaderIcon />
								</div>
							</div>
						)}
					</>
				)}
			</div>
		);
	}
}

FolderFeeds.propTypes = {
	dispatch: PropTypes.func.isRequired,
	sortBy: PropTypes.string,
	pinnedArticles: PropTypes.shape({}),
	pinnedEpisodes: PropTypes.shape({}),
	folder: PropTypes.shape({
		_id: PropTypes.string,
		streamToken: PropTypes.string,
	}),
};

const mapStateToProps = (state) => ({
	pinnedArticles: state.pinnedArticles || {},
	pinnedEpisodes: state.pinnedEpisodes || {},
});

export default connect(mapStateToProps)(FolderFeeds);
