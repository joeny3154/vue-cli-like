const path = require('path')

module.exports = {
  dev: {
    showEslintErrorsInOverlay: false,
    cssSourceMap: false,
    publicPath: '/',
    assetsSubDirectory: 'static',
    notifyOnErrors: true,
    port: 8080
  },
  build: {
    productionSourceMap: true,
    assetsRoot: path.resolve(__dirname, '../dist'),
    publicPath: '/',
    assetsSubDirectory: 'static',
    bundleAnalyzerReport: process.env.npm_config_report
  }
}