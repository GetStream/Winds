const webpack = require('webpack')
const path = require('path')

const CopyWebpackPlugin = require('copy-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const commonsChunkPlugin = new webpack.optimize.CommonsChunkPlugin({
  name: "common",
  filename: 'common.js'
})


const plugins = [
  new webpack.DefinePlugin({
    __DEV__: JSON.stringify(JSON.parse(process.env.BUILD_DEV || 'true')),
    __PRERELEASE__: JSON.stringify(JSON.parse(process.env.BUILD_PRERELEASE || 'false'))
  }),
  commonsChunkPlugin,
  new ExtractTextPlugin({
    filename: '../../styles/app/styles.css',
    allChunks: true
  }),
  new CopyWebpackPlugin([{ from: 'assets/robots.txt', to: '../../robots.txt' }])
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
      common: [
        'lodash',
        'react',
        'react-addons-css-transition-group',
        'react-deep-force-update',
        'react-dom',
        'react-hot-loader',
        'react-proxy',
        'react-redux',
        'react-router',
        'react-router-redux'],
      bundle: path.resolve(__dirname, '../assets/js/index.js'),
    },
    output: {
      path: path.resolve(__dirname, '../.tmp/public/js/app'),
      filename: '[name].js'
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          use: [{loader: 'babel-loader'}],
          exclude: /node_modules/,
        },
        {
          test: /\.scss$/,
          use: ExtractTextPlugin.extract({
            use: ['css-loader', 'sass-loader']
          }),
        }
      ]
    },
    resolve: {
      modules: [
        path.resolve(__dirname, '../assets/js'),
        'node_modules'
      ],
      alias: {
        containers: 'containers',
        components: 'components',
        actions: 'actions',
        reducers: 'reducers',
      },
      extensions: ['.js', '.jsx']
    },
    plugins: plugins,
    node: {
      fs: 'empty'
    },
    watchOptions: {
      aggregateTimeout: 300
    }
  }
}
