module.exports = {
  context: __dirname + '/src',
  entry: './index',
  output: {
    library: 'ngMockWindow',
    libraryTarget: 'umd',
    path: __dirname + '/dist',
    filename: 'window.js'
  },
  module: {
    preLoaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'eslint-loader'
    }],
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader'
    }, {
      test: /\.json$/,
      loader: 'json-loader'
    }]
  }
};
