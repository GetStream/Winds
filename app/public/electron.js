const { app, BrowserWindow, shell, ipcMain, Menu, protocol } = require('electron');

const path = require('path');
const isDev = require('electron-is-dev');

let mainWindow;

function createWindow() {
	mainWindow = new BrowserWindow({
		backgroundColor: '#F7F7F7',
		height: 800,
		minWidth: 850,
		show: false,
		titleBarStyle: 'hidden',
		webPreferences: {
			nodeIntegration: false,
			preload: __dirname + '/preload.js',
		},
		width: 1280,
	});

	mainWindow.loadURL(
		isDev
			? 'http://localhost:3000'
			: `file://${path.join(__dirname, '../build/index.html')}`,
	);

	if (isDev) {
		const {
			default: installExtension,
			REACT_DEVELOPER_TOOLS,
			REDUX_DEVTOOLS,
		} = require('electron-devtools-installer');

		installExtension(REACT_DEVELOPER_TOOLS)
			.then(name => {
				console.log(`Added Extension: ${name}`); // eslint-disable-line no-console
			})
			.catch(err => {
				console.log('An error occurred: ', err); // eslint-disable-line no-console
			});

		installExtension(REDUX_DEVTOOLS)
			.then(name => {
				console.log(`Added Extension: ${name}`); // eslint-disable-line no-console
			})
			.catch(err => {
				console.log('An error occurred: ', err); // eslint-disable-line no-console
			});
	}

	mainWindow.once('ready-to-show', () => {
		mainWindow.show();

		ipcMain.on('open-external-window', function(event, arg) {
			shell.openExternal(arg);
		});
	});
}

function registerProtocol() {
	protocol.registerFileProtocol(
		'winds',
		(request, callback) => {
			const url = request.url.substr(8);
			callback({ path: path.normalize(`${__dirname}/${url}`) });
		},
		error => {
			if (error) {
				console.error('Failed to register protocol'); // eslint-disable-line no-console
			}
		},
	);
}

function generateMenu() {
	// apple menu guidelines: https://developer.apple.com/macos/human-interface-guidelines/menus/menu-anatomy/
	const template = [
		{
			label: 'File',
			submenu: [{ role: 'quit' }, { role: 'new' }],
		},
		{
			label: 'Edit',
			submenu: [
				{ role: 'undo' },
				{ role: 'redo' },
				{ type: 'separator' },
				{ role: 'cut' },
				{ role: 'copy' },
				{ role: 'paste' },
				{ role: 'pasteandmatchstyle' },
				{ role: 'delete' },
				{ role: 'selectall' },
			],
		},
		{
			label: 'View',
			submenu: [
				{ role: 'reload' },
				{ role: 'forcereload' },
				{ role: 'toggledevtools' },
				{ type: 'separator' },
				{ role: 'resetzoom' },
				{ role: 'zoomin' },
				{ role: 'zoomout' },
				{ type: 'separator' },
				{ role: 'togglefullscreen' },
			],
		},
		{
			role: 'window',
			submenu: [{ role: 'minimize' }, { role: 'close' }],
		},
		{
			role: 'help',
			submenu: [
				{
					click() {
						require('electron').shell.openExternal(
							'https://getstream.io/winds',
						);
					},
					label: 'Learn More',
				},
				{
					click() {
						require('electron').shell.openExternal(
							'https://github.com/GetStream/Winds/issues',
						);
					},
					label: 'File Issue',
				},
			],
		},
	];

	Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.on('ready', () => {
	createWindow();
	generateMenu();

	app.setAsDefaultProtocolClient('winds');
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if (mainWindow === null) {
		createWindow();
	}
});

ipcMain.on('load-page', (event, arg) => {
	mainWindow.loadURL(arg);
});
