const {
	app,
	BrowserWindow,
	shell,
	ipcMain,
	Menu,
	TouchBar,
	remote,
} = require('electron');

const { TouchBarButton, TouchBarLabel, TouchBarSpacer } = TouchBar;
const isDev =
	'ELECTRON_IS_DEV' in process.env
		? parseInt(process.env.ELECTRON_IS_DEV, 10) === 1
		: !(app || remote.app).isPackaged;

let mainWindow;

const createWindow = () => {
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
		isDev ? 'http://localhost:3000' : `file://${__dirname}/index.html`,
	);

	if (isDev) mainWindow.webContents.openDevTools();

	mainWindow.once('ready-to-show', () => {
		mainWindow.show();

		ipcMain.on('open-external-window', (event, arg) => {
			shell.openExternal(arg);
		});

		ipcMain.on('media-controls', (event, args) => {
			mediaControls(event, args);
		});
	});

	mainWindow.on('close', (event) => {
		if (app.quitting) mainWindow = null;
		else {
			event.preventDefault();
			mainWindow.hide();
		}
	});
};

const generateMenu = () => {
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
						shell.openExternal('https://getstream.io/winds');
					},
					label: 'Learn More',
				},
				{
					click() {
						shell.openExternal('https://github.com/GetStream/Winds/issues');
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
		{ role: 'reload' },
		{ role: 'forcereload' },
		{ role: 'toggleDevTools' },
		{ type: 'separator' },
		{ role: 'zoom' },
		{ type: 'separator' },
		{ role: 'front' },
	];

	template[4].submenu.push(
		{ type: 'separator' },
		{
			label: 'Winds',
			click() {
				mainWindow.show();
			},
		},
	);

	Menu.setApplicationMenu(Menu.buildFromTemplate(template));
};

const mediaControls = (event, args) => {
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

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
	if (mainWindow === null) createWindow();
	else mainWindow.show();
});

app.on('before-quit', () => (app.quitting = true));

ipcMain.on('load-page', (event, arg) => {
	mainWindow.loadURL(arg);
});
