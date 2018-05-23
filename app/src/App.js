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

if (isElectron) {
	// Electron-specific code
	document.body.addEventListener('click', e => {
		if (e.target.nodeName === 'A') {
			const href = e.target.getAttribute('href');
			if (!href.includes('#/')) {
				e.preventDefault();
				window.ipcRenderer.send('open-external-window', href);
			}
		}
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
