const resolve = require('path').resolve;

module.exports = {
  entry: resolve(__dirname, 'demo/imports.js'),
  output: {
    path: resolve(__dirname, 'docs'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.js/,
        exclude: resolve(__dirname, 'node_modules'),
        use: [{
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: ['@babel/plugin-syntax-dynamic-import']
          }
        }]
      }
    ]
  },
  optimization: {
    minimize: false
  }
}