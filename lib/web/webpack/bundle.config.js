const path = require('path');

/* input dirname */
const srcDirname = path.resolve(__dirname, '../src');

/* output dirname */
const distDirname = path.resolve(__dirname, '../dist');

/* base config */
module.exports = {
  entry: {
    bundle: srcDirname + '/index.js' // Entry point for your application
  },
  output: {
    filename: '[name].js',
    path: distDirname,
    publicPath: './' // Adjust according to your deployment setup
  },

  /* load modules */
  module: {
    rules: [
      {
        test: /\.js$/, // Target js files
        loader: 'babel-loader',
        exclude: /node_modules/, // Correctly exclude node_modules using regex
        include: srcDirname,
        options: {
          presets: ['@babel/preset-env', '@babel/preset-react'] // Updated presets
        }
      },
      {
        test: /\.css$/, // Target CSS files
        use: ['style-loader', 'css-loader'] // Loaders for CSS
      }
    ]
  },

  resolve: {
    alias: {
      app: srcDirname,
      components: path.resolve(srcDirname, 'components'),
      actions: path.resolve(srcDirname, 'actions'),
      reducers: path.resolve(srcDirname, 'reducers'),
      services: path.resolve(srcDirname, 'services')
    },
    extensions: ['.js', '.json', '.css', '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg'] // File extensions to resolve
  }
};
