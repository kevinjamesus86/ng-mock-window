module.exports = {
  context: __dirname + "/src",
  entry: "./window",
  output: {
    library: 'ngMockWindow',
    libraryTarget: 'umd',
    path: __dirname + "/dist",
    filename: "window.js"
  },
  module: {
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
