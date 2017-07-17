// webpack.config.dev.js
const path = require('path');
const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  devtool: 'source-map',
  entry: {
    'main': [
      './src/javascript/build'
    ]
  },
  output: {
    path: path.join(__dirname, 'build/assets/javascript'),
    publicPath: 'http://localhost:3000/build/assets/javascript',
    filename: '[name]-bundle.js',
    chunkFilename: '[id]-[hash]-bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.coffee$/,
        use: [
          {
            loader: 'coffee-loader',
            options: {
              sourceMap: true
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new UglifyJsPlugin({
      sourceMap: true
    })
  ]
};