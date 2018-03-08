'use strict'
const webpackBaseConf = require('./webpack.base.conf')
const merge = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')
const webpack = require('webpack')
const config = require('../config')
const utils = require('./utils')

const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin') // 能够更好在终端看到webapck运行的警告和错误
const portfinder = require('portfinder') // 自动检索下一个可用端口

const devWebpackConfig = merge(webpackBaseConf, {
  module: {
    rules: utils.styleLoaders({ sourceMap: config.dev.cssSourceMap, usePostCSS: true })
  },
  devServer: {
    // contentBase: path.join(__dirname, '../public'),
    host: 'localhost',
    port: 8080,
    publicPath: config.dev.assetsPublicPath,
    // 启用热替换模块
    hot: true
    // open: true
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"development"'
      }
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html', // 使用自己的提供的html模板
      inject: true
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.NoEmitOnErrorsPlugin(), 
  ]
})

// module.exports = devWebpackConf
module.exports = new Promise((resolve, reject) => {
  // 获取当前设定的端口
  portfinder.basePort = process.env.PORT || config.dev.port
  portfinder.getPort((err, port) => {
    if (err) {
      reject(err)
    } else {
      // 发布新的端口
      process.env.PORT = port
      // 设置 devServer 端口
      devWebpackConfig.devServer.port = port
      // 能够更好在终端看到webapck运行的警告和错误
      devWebpackConfig.plugins.push(new FriendlyErrorsPlugin({
        // 编译成功提醒
        compilationSuccessInfo: {
          messages: [`Your application is running here: http://${devWebpackConfig.devServer.host}:${port}`],
        },
        // 此处为 notifyOnErrors 设置 true
        onErrors: config.dev.notifyOnErrors
        ? utils.createNotifierCallback()
        : undefined
      }))

      resolve(devWebpackConfig)
    }
  })
})