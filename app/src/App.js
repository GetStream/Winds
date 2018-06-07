import './styles/global.css';

import React, { Component } from 'react';
import AppRouter from './AppRouter.js';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import fetch from './util/fetch';
import reducer from './reducers';

let initialState = {};

if ('authedUser' in localStorage) {
	try {
		initialState['authedUser'] = localStorage['authedUser'];
	} catch (e) {
		initialState['authedUser'] = null;
	}
}

if (initialState['authedUser']) {
	fetch('GET', `/users/${initialState['authedUser']}`).then(res => {
		if (!initialState.users) {
			initialState.users = {};
		}
		initialState.users[res.data._id] = res.data;
	});
}

initialState['showIntroBanner'] = true;
if (localStorage['dismissedIntroBanner'] === 'true') {
	initialState['showIntroBanner'] = false;
}

var userAgent = navigator.userAgent.toLowerCase();
let isElectron = userAgent.indexOf(' electron/') > -1;

let store;

if (isElectron) {
	store = createStore(reducer, initialState);
} else {
	store = createStore(
		reducer,
		initialState,
		window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
	);
}

const crawlUpDomForAnchorTag = (node, e) => {
	if (!node) {
		// if we've reached the top of the DOM
		return;
	} else if (node.nodeName === 'A') {
		const href = node.getAttribute('href');
		if (href && !href.includes('#/')) {
			e.preventDefault();
			window.ipcRenderer.send('open-external-window', href);
		} else {
			return;
		}
	} else {
		return crawlUpDomForAnchorTag(node.parentNode, e); // need to pass the click event down through the recursive calls so we can preventDefault if needed
	}
};

if (isElectron) {
	// Electron-specific code
	document.body.addEventListener('click', e => {
		crawlUpDomForAnchorTag(e.target, e);
	});
}

class App extends Component {
	render() {
		return (
			<Provider store={store}>
				<AppRouter />
			</Provider>
		);
	}
}

export default App;
