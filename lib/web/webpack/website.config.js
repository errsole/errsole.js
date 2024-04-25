const { merge } = require('webpack-merge');
const path = require('path');
const CompressionPlugin = require('compression-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

/* base webpack */
const bundleConfig = require('./bundle.config.js');

/* params */
const mode = 'production';

const websiteOutput = merge(bundleConfig, {
  mode,
  devServer: {
    contentBase: path.join(__dirname, '../dist'),
    historyApiFallback: true,
    hot: true,
    compress: true
  },
  plugins: [
    new CompressionPlugin()
  ],
  optimization: {
    minimizer: [new TerserPlugin()]
  }
});

module.exports = [websiteOutput];
