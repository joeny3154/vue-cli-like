'use strict'
// 检查版本 node  npm 
require('./check-versions')()
// 设置当前环境为生产环境
process.env.NODE_ENV = 'production'

const path = require('path')
const webpack = require('webpack')
const config = require('../config')
const webpackConfig = require('./webpack.prod.conf')
const rm = require('rimraf')
const chalk = require('chalk') // stdout颜色设置
const ora = require('ora')

const spinner = ora('building for production...') // 正在编译...
spinner.start()

rm(path.join(config.build.assetsRoot, config.build.assetsSubDirectory), err => {
  if (err) throw err
  webpack(webpackConfig, (err, stats) => {
    spinner.stop()
    if (err) throw err
    process.stdout.write(stats.toString({
      colors: true,
      modules: false,
      children: false,
      chunks: false,
      chunkModules: false
    }) + '\n\n')
    // error
    if (stats.hasErrors()) {
      console.log(chalk.red('  Build failed with errors.\n'))
      // process.exit()方法以结束状态码code指示Node.js同步终止进程。'failure'状态码: 1, 'success' 状态码 0
      process.exit(1)
    }
    // 完成
    // chalk.cyan: 青色；chalk.yellow: 黄色
    console.log(chalk.cyan('  Build complete.\n'))
    console.log(chalk.yellow(
      '  Tip: built files are meant to be served over an HTTP server.\n' +
      '  Opening index.html over file:// won\'t work.\n'
    ))
  })
})