(function() {
	const remote = require('electron').remote;

	function init() {
		document.getElementById('window-min').addEventListener('click', function() {
			const window = remote.getCurrentWindow();
			window.minimize();
		});

		document.getElementById('window-max').addEventListener('click', function() {
			const window = remote.getCurrentWindow();
			if (!window.isMaximized()) {
				window.maximize();
			} else {
				window.unmaximize();
			}
		});

		document.getElementById('window-close').addEventListener('click', function() {
			const window = remote.getCurrentWindow();
			window.close();
		});
	}

	document.onreadystatechange = function() {
		if (document.readyState === 'complete') {
			init();
		}
	};
})();
