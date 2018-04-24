import './index.css';
import App from './App';
import React from 'react';
import ReactDOM from 'react-dom';
import packageInfo from '../package.json';
import Loader from './components/Loader';
import axios from 'axios';

class UpdateWrapper extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			bypassed: false,
			downloadURL: '',
			loading: true,
			onLatestVersion: false,
		};
	}
	componentDidMount() {
		axios(
			'https://s3.amazonaws.com/winds-2.0-releases/releases/latest-mac.json',
		).then(response => {
			if (response.data.version === packageInfo.version) {
				this.setState({
					loading: false,
					onLatestVersion: true,
				});
			} else {
				this.setState({
					downloadURL: response.data.url.replace('-', ''),
					loading: false,
				});
			}
		});
	}
	render() {
		if (this.state.loading) {
			return <Loader />;
		} else if (!this.state.onLatestVersion && !this.state.bypassed) {
			return (
				<div className="download">
					<p>
						{
							'Hang on! Looks like you don\'t have the latest version of Winds.'
						}
					</p>
					<a className="btn primary" href={this.state.downloadURL}>
						Download the latest version of Winds here
					</a>
					<button
						className="btn link"
						onClick={e => {
							e.preventDefault();
							e.stopPropagation();
							this.setState({
								bypassed: true,
							});
						}}
					>
						{'I\'ll update later'}
					</button>
				</div>
			);
		} else {
			return <App />;
		}
	}
}

ReactDOM.render(<UpdateWrapper />, document.getElementById('root'));
