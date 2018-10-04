import React from 'react';
import isElectron from 'is-electron';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { createHashHistory, createBrowserHistory } from 'history';

import AppRouter from './AppRouter.js';
import reducer from './reducers';
import './styles/global.scss';

let initialState = {};
if ('authedUser' in localStorage) {
	try {
		initialState['authedUser'] = localStorage['authedUser'];
	} catch (e) {
		initialState['authedUser'] = null;
	}
}

let store;
let history;
if (isElectron()) {
	history = createHashHistory();
	store = createStore(reducer, initialState);
} else {
	history = createBrowserHistory();
	store = createStore(
		reducer,
		initialState,
		window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
	);
}

const crawlUpDomForAnchorTag = (node, e) => {
	if (!node) {
		return;
	} else if (node.nodeName === 'A') {
		const href = node.getAttribute('href');
		if (href && !href.includes('#/') && isElectron()) {
			e.preventDefault();
			window.ipcRenderer.send('open-external-window', href);
		} else {
			return;
		}
	} else {
		// need to pass the click event down through the recursive calls so we can preventDefault if needed
		return crawlUpDomForAnchorTag(node.parentNode, e);
	}
};

if (isElectron()) {
	document.body.addEventListener('click', (e) => {
		crawlUpDomForAnchorTag(e.target, e);
	});
}

const App = () => (
	<Provider store={store}>
		<AppRouter history={history} />
	</Provider>
);

export default App;
