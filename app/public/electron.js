const { app, BrowserWindow, shell, ipcMain, Menu, TouchBar } = require('electron');
const { TouchBarButton, TouchBarLabel, TouchBarSpacer } = TouchBar;

const path = require('path');
const isDev = require('electron-is-dev');

let mainWindow;

createWindow = () => {
	mainWindow = new BrowserWindow({
		backgroundColor: '#F7F7F7',
		minWidth: 880,
		show: false,
		titleBarStyle: 'hidden',
		webPreferences: {
			nodeIntegration: false,
			preload: __dirname + '/preload.js',
		},
		height: 860,
		width: 1280,
	});

	mainWindow.loadURL(
		isDev
			? 'http://localhost:3000'
			: `file://${path.join(__dirname, '../build/index.html')}`,
	);

	if (isDev) {
		mainWindow.webContents.openDevTools();
	}

	mainWindow.once('ready-to-show', () => {
		mainWindow.show();

		ipcMain.on('open-external-window', (event, arg) => {
			shell.openExternal(arg);
		});

		ipcMain.on('media-controls', (event, args) => {
			mediaControls(event, args);
		});
	});
};

generateMenu = () => {
	let template = [
		{
			label: 'File',
			submenu: [{ role: 'about' }, { role: 'quit' }],
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
					label: 'File Issue on GitHub',
				},
			],
		},
	];

	if (process.platform === 'darwin') {
		template.unshift({
			label: app.getName(),
			submenu: [
				{ role: 'about' },
				{ type: 'separator' },
				{ role: 'services', submenu: [] },
				{ type: 'separator' },
				{ role: 'hide' },
				{ role: 'hideothers' },
				{ role: 'unhide' },
				{ type: 'separator' },
				{ role: 'quit' },
			],
		});
	}

	template[1].submenu.push(
		{ type: 'separator' },
		{
			label: 'Speech',
			submenu: [{ role: 'startspeaking' }, { role: 'stopspeaking' }],
		},
	);

	template[3].submenu = [
		{ role: 'close' },
		{ role: 'minimize' },
		{ role: 'zoom' },
		{ type: 'separator' },
		{ role: 'front' },
	];

	Menu.setApplicationMenu(Menu.buildFromTemplate(template));
};

mediaControls = (event, args) => {
	let next = new TouchBarButton({
		icon: `${__dirname}/static/next.png`,
		click: () => {
			event.sender.send('media-controls', 'next');
		},
	});

	let previous = new TouchBarButton({
		icon: `${__dirname}/static/previous.png`,
		click: () => {
			event.sender.send('media-controls', 'previous');
		},
	});

	let playPause = new TouchBarButton({
		icon: `${__dirname}/static/pause.png`,
		click: () => {
			event.sender.send('media-controls', 'togglePlayPause');
		},
	});

	let info = new TouchBarLabel({
		label:
			args.title && args.title.length > 40
				? `${args.title.substr(0, 40) + '...'}`
				: args.title,
		textColor: '#FFFFFF',
	});

	if (args.type === 'play') {
		playPause.icon = `${__dirname}/static/pause.png`;
		info.label = args.title;
	} else {
		playPause.icon = `${__dirname}/static/play.png`;
	}

	let touchBar = new TouchBar([
		previous,
		playPause,
		next,
		new TouchBarSpacer({ size: 'flexible' }),
		info,
		new TouchBarSpacer({ size: 'flexible' }),
	]);

	mainWindow.setTouchBar(touchBar);
};

app.on('ready', () => {
	createWindow();
	generateMenu();
});

app.on('close', event => {
	event.preventDefault();
	mainWindow.hide();
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	} else {
		mainWindow.hide();
	}
});

app.on('activate', () => {
	if (mainWindow === null) {
		createWindow();
	}
});

app.on('activate', createWindow);

ipcMain.on('load-page', (event, arg) => {
	mainWindow.loadURL(arg);
});
