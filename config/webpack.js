var webpack = require('webpack')

var definePlugin = new webpack.DefinePlugin({
    __DEV__: JSON.stringify(JSON.parse(process.env.BUILD_DEV || 'true')),
    __PRERELEASE__: JSON.stringify(JSON.parse(process.env.BUILD_PRERELEASE || 'false'))
})

var commonsPlugin = new webpack.optimize.CommonsChunkPlugin('common.js')

var ExtractTextPlugin = require('extract-text-webpack-plugin')

const path = require('path')

const extractCSS = new ExtractTextPlugin('../../styles/app/styles.css')

const plugins = [
    definePlugin,
    commonsPlugin,
    extractCSS,
]

if (process.env.NODE_ENV == 'production') {
    plugins.push(new webpack.optimize.UglifyJsPlugin({
        compress: {
            warnings: true
        }
    }))
}

module.exports.webpack = {
    options: {
        cache: true,
        devtool: 'eval',
        entry: {
            main: path.resolve(__dirname, '../assets/js/index.js'),
        },
        output: {
            path: path.resolve(__dirname, '../.tmp/public/js/app'),
            filename: 'bundle.js'
        },
        module: {
            loaders: [
                {
                    test: /\.jsx?$/,
                    loaders: ['babel-loader'],
                    exclude: /node_modules/,
                },
                {
                    test: /\.scss$/,
                    loader: extractCSS.extract(['css','sass'])
                }
            ]
        },
        resolve: {
            root: path.resolve(__dirname, '../assets/js'),
            alias: {
                containers: 'containers',
                components: 'components',
                actions: 'actions',
                reducers: 'reducers',
            },
            extensions: ['', '.js', '.jsx']
        },
        plugins: plugins,
        node: {
            fs: 'empty'
        }
    },
    watchOptions: {
        aggregateTimeout: 300
    }
}
