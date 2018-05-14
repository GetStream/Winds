<html>
    <head>
        <title>Winds ${version} | Powered by GetStream.io</title>
        <style type="text/css">
            html,
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
                font-size: 16px;
                text-align: center;
                margin-top: 10%;
                background-color: #F7F7F7;
            }
            p {
                color: #44bc75;
            }
        </style>
    </head>
    <body>
        <h1>Redirecting you to the Winds ${version} download page...</h1>
        <p class="notice">This may take a few moments...</p>

        <script type="text/javascript">
            var os = navigator.appVersion;

            if (os.indexOf('Mac') != -1) {
                window.location.href = 'https://itunes.apple.com/us/app/winds-by-getstream-io/id1381446741';
            } else if (os.indexOf('Linux') != -1 || os.indexOf('X11') != -1) {
                window.location.href = 'https://snapcraft.io/winds';
            } else if (os.indexOf('Windows') != -1) {
                window.location.href = 'https://s3.amazonaws.com/winds-2.0-releases/releases/Winds%20Setup%20${version}.exe';
            } else {
                document.write('<p>Sorry, your device is not supported. :(</p>');
            }
        </script>
    </body>
</html>
