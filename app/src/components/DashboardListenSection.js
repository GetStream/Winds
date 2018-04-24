import React from 'react';
import PodcastSuggestions from './PodcastSuggestions';
import PodcastPanelsContainer from './PodcastPanelsContainer';
import ShowsGrid from './ShowsGrid';

class DashboardListenSection extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			currentTab: localStorage['selectedListenTab'] || 'suggestions',
		};
	}

	componentDidMount() {}
	render() {
		let contents = null;
		if (this.state.currentTab === 'suggestions') {
			contents = <PodcastSuggestions />;
		} else if (this.state.currentTab === 'episodes') {
			contents = <PodcastPanelsContainer />;
		} else if (this.state.currentTab === 'shows') {
			contents = <ShowsGrid />;
		}
		return (
			<div>
				<ul className="tabs">
					<li
						className={`tab ${
							this.state.currentTab === 'episodes' ? 'active' : ''
						}`}
						onClick={() => {
							localStorage['selectedListenTab'] = 'episodes';
							this.setState({
								currentTab: 'episodes',
							});
						}}
					>
						episodes
					</li>
					<li
						className={`tab ${
							this.state.currentTab === 'shows' ? 'active' : ''
						}`}
						onClick={() => {
							localStorage['selectedListenTab'] = 'shows';
							this.setState({
								currentTab: 'shows',
							});
						}}
					>
						shows
					</li>
					<li
						className={`tab ${
							this.state.currentTab === 'suggestions' ? 'active' : ''
						}`}
						onClick={() => {
							localStorage['selectedListenTab'] = 'suggestions';
							this.setState({
								currentTab: 'suggestions',
							});
						}}
					>
						suggestions
					</li>
				</ul>
				{contents}
			</div>
		);
	}
}

export default DashboardListenSection;
