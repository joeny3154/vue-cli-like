
const path = require('path')
const webpack = require('webpack')
const utils = require('./utils')
const config = require('../config/index')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const env = require('../config/prod.env.js')

const webpackConfig = merge(baseWebpackConfig, {
  devtool: config.build.productionSourceMap ? config.build.devtool : false,
  module: {
    rules: utils.styleLoaders({
      sourceMap: config.build.productionSourceMap,
      extract: true,
      usePostCSS: true
    })
  },
  output: {
    path: config.build.assetsRoot,
    filename: utils.assetsPath('js/[name].[chunkhash].js'),
    // 其他chunk（如异步组件、按需加载的模块） 打包至dist/static/js目录下
    chunkFilename: utils.assetsPath('js/[id].[chunkhash].js')
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': env
    }),
    new HtmlWebpackPlugin({
      filename: path.resolve(__dirname, '../dist/index.html'),
      template: 'index.html',
      inject: true,
      chunksSortMode: 'dependency',
      minify: {
        removeComments: true, // 移除注释
        collapseWhitespace: true, // 去除空格和换行
        removeAttributeQuotes: true // 移除属性中的引号
      },
    }),
    new ExtractTextPlugin({
      filename: utils.assetsPath('css/[name].[contenthash].css'),
      // 如果你想从代码片段中提取CSS到这个主要的CSS文件，那么把下面的选项设置为`true`。 这将导致你的应用程序的所有CSS被预先加载。
      allChunks: false,
    }),
    new OptimizeCSSPlugin({
      cssProcessorOptions: config.build.productionSourceMap
        ? { safe: true, map: { inline: false } }
        : { safe: true }
    }),
    // new webpack.HashedModuleIdsPlugin(),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks (module) {
        return (
          module.resource && /\.js$/.test(module.resource) && module.resource.indexOf(
            path.join(__dirname, '../node_modules')
          ) === 0
        )
      }
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest',
      minChunks: Infinity
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'app',
      async: 'vendor-async',
      children: true,
      minChunks: 2
    }),
    new CopyWebpackPlugin([
      {
        // 定义要拷贝的资源的源目录
        from: path.resolve(__dirname, '../static'),
        // 定义要拷贝的资源的目标目录
        to: config.build.assetsSubDirectory,
        // 忽略拷贝指定的文件，可以使用模糊匹配
        ignore: ['.*']
      }
    ]),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new UglifyJsPlugin({
      uglifyOptions: {
        // 压缩
        compress: {
          warnings: false
        }
      },
      sourceMap: config.build.productionSourceMap,
      // 使用多进程并行运行来提高构建速度,默认为false。为true时并发运行的默认数量：os.cpus().length - 1
      parallel: true
    }),
  ]
})

// 可视化分析包的尺寸
if (config.build.bundleAnalyzerReport) {
  const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
  webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = webpackConfig