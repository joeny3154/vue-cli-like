生产环境基础配置
=====

先实现基础配置，代码如下：

``` js
// webpack.prod.conf.js
const path = require('path')
const webpack = require('webpack')
const utils = require('./utils')
const config = require('../config/index')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const webpackConfig = merge(baseWebpackConfig, {
  devtool: config.build.productionSourceMap ? config.build.devtool : false,
  output: {
    path: config.build.assetsRoot,
    filename: utils.assetsPath('js/[name].[chunkhash].js'),
    // 其他chunk（如异步组件、按需加载的模块）打包至dist/static/js目录下
    chunkFilename: utils.assetsPath('js/[id].[chunkhash].js')
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new HtmlWebpackPlugin({
      filename: path.resolve(__dirname, '../dist/index.html'),
      template: 'index.html',
      inject: true,
    })
  ]
})

module.exports = webpackConfig
```

**`hash vs chunkhash`**

在 webpack 里，我们可以通过设置 `hash/chunkhash` 来自动更新文件名.主要区别如下：

- `hash`: `build-specific` ，即每次编译都不同, 适用于开发阶段。

- `chunkhash`: `chunk-specific`，是根据每个 chunk 的内容计算出的 hash, 适用于生产。

### build脚本

webpack 提供了 Node.js API，可以在 Node.js 运行时下直接使用, 我们只需要写一个`node.js`脚本(即`build/build.js`), 安装并导入webpack 模块后, 导入的 `webpack` 函数需要传入一个 webpack 配置对象，当同时传入**回调函数**时就会执行 `webpack compiler`(webpack 编译器)，类似这样:

``` js
const webpack = require("webpack")

webpack({
  // 配置对象
}, (err, stats) => {
  if (err || stats.hasErrors()) {
    // 在这里处理错误
  }
  // 处理完成
});
```

如果你不向 `webpack` 执行函数传入回调函数，就会得到一个 `webpack Compiler` 实例。你可以通过它手动触发 `webpack` 执行器，或者是让它执行构建并监听变更。和 `CLI API` 很类似。`Compiler` 实例提供了两个方法：`.run(callback)`, `.watch(watchOptions, handler)`, 具体可查看[这里](https://doc.webpack-china.org/api/node/#webpack-)


我们具体实现一下`build/build.js`, 并额外增加`ora`、`rimraf` 和 `chalk` 模块完善此脚本的功能：

`ora`: 在 `node.js` 命令行环境下添加 loading 效果，webpack编译器执行过程中开启，完成后关闭

`rimraf`: 根据生产环境下配置，webpack 输出它所创建的 `bundles` 将存在于项目根目录的`dist`目录下，静态资源都存在`dist/static`目录下，但如果第二次执行构建脚本前则需要手动删除掉`dist/static`目录下的内容，以防止之前的`bundles`保留下来，这里我们使用`rimraf`来替代手动删除的工作

`chalk`: 我们可以使用`console.log` 根据 `webpack` 不同构建结果输出一些提示信息，我们使用`chalk`可以给输出内容添加上颜色，eg: `console.log(chalk.yellow('Yellow message'))`

具体代码如下：

``` js
'use strict'
// 设置当前环境为生产环境，务必写在代码顶部，否则可能导致使用`process.env.NODE_ENV`的 module 中对当前环境判断错误 或者 NODE_ENV 为 undefined
process.env.NODE_ENV = 'production'

const path = require('path')
const webpack = require('webpack')
const config = require('../config')
const webpackConfig = require('./webpack.prod.conf')

const rm = require('rimraf')
const chalk = require('chalk')
const ora = require('ora')

const spinner = ora('building for production...')

spinner.start()
rm(path.join(config.build.assetsRoot, config.build.assetsSubDirectory), err => {
  if (err) throw err
  webpack(webpackConfig, (err, stats) => {
    spinner.stop()
    // 此err 对象只会包含 webpack 相关的问题，比如配置错误等
    if (err) throw err
    process.stdout.write(stats.toString({
      colors: true,
      modules: false,
      children: false,
      chunks: false,
      chunkModules: false
    }) + '\n\n')
    // 出现编译错误, 注意：编译错误不在 err 对象内，而是需要使用 stats.hasErrors() 单独处理， err 对象只会包含 webpack 相关的问题，比如配置错误等
    if (stats.hasErrors()) {
      console.log(chalk.red('  Build failed with errors.\n'))
      // process.exit()方法：以结束状态码code指示Node.js同步终止进程。'failure'状态码: 1, 'success' 状态码 0
      process.exit(1)
    }
    // 处理完成
    console.log(chalk.cyan('  Build complete.\n'))
    console.log(chalk.yellow(
      '  Tip: built files are meant to be served over an HTTP server.\n' +
      '  Opening index.html over file:// won\'t work.\n'
    ))
  })
})
```

以上我们就完成了一个执行 `webpack compiler`的 `NodeJS` 脚本，通过`node build/build.js`即可执行，但我们希望通过`npm run build`的方式执行此脚本，添加到`package.json`即可，eg:

``` json
"scripts": {
  "build": "node build/build.js"
},
```

执行`npm run build`后可以发现新建了一个`dist`目录，里面存放了`HtmlWebpackPlugin`生成的`html`文件，`static`目录下存放着所创建的 `bundles`