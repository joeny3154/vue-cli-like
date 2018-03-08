图片、媒体资源、字体等loader配置
=========

webpack 支持把 `require` 图片、音视频、字体等资源, 通过设置`limit`还可以在文件大小（单位 byte, 即字节）低于指定的限制时，可以返回一个 DataURL

安装loader: `npm i --save-dev url-loader file-loader`，*`url-loader` 依赖 `file-loader`*

`file-loader` 将文件输出到输出目录并返回 public URL, eg: `"/public/path/0dcbbaa7013869e351f.png"`

`url-loader` 功能类似于 `file-loader`，但是在文件大小（单位 byte）低于指定的限制时（设置`options.limit`选项），可以返回一个 DataURL。


![.png转成DataURL](./images/6.jpeg)

在`build/webpack.base.conf.js`文件`rules`添加如下配置：

``` js
// assetsSubDirectory：资源文件根目录（path）/发布目录 （publicPath）下的子目录
const assetsSubDirectory = 'static'
{
  test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
  loader: 'url-loader',
  options: {
    // 小于 10000 byte 打包到js中
    limit: 10000,
    // path.posix 属性提供了 path 方法针对 POSIX 的实现
    name: path.posix.join(assetsSubDirectory, 'img/[name].[hash:7].[ext]') // static/img/[name].[hash:7].[ext]
  }
},
```

webpack 会将打包后的资源存在`output.path` 目录下, 这里我们指定的是根目录下的 `dist`目录(`path.resolve(__dirname, '../dist')`), 除js以外的静态资源会根据 `output.publicPath` 配置将图片等这些静态资源存放到对应的文件夹下，上面 assetsSubDirectory设置为 static, 
打包后的文件路径就是 `output.path/output.publicPath/output.assetsSubDirectory/options.name`,
由于开发环境和生产环境下可能需要做不同的配置，我们把`assetsRoot`(即：`output.path`配置)/`publicPath` 和 `assetsSubDirectory`添加到`config/index.js`中：

``` js
module.exports = {
  dev: {
    // ...
    publicPath: '/',
    assetsSubDirectory: 'static',
  },
  build: {
    // ...
    assetsRoot: path.resolve(__dirname, '../dist'),
    publicPath: '/',
    assetsSubDirectory: 'static'
  }
}
```

并对之前的配置做相应的调整：

``` js
// webpack.base.conf.js
output: {
  path: config.build.assetsRoot,
  filename: '[name].js',
  // 为何console.log(process.env.NODE_ENV)
  publicPath: process.env.NODE_ENV === 'production'
    ? config.build.assetsPublicPath
    : config.dev.assetsPublicPath
},
```
``` js
// webpack.dev.conf.js
devServer: {
  // ...
  publicPath: config.dev.assetsPublicPath,
},
```

**注意：**上面publicPath 配置中使用的 `process.env.NODE_ENV` 是通过设置node的环境变量标识 `process.env.NODE_ENV`获得的，eg: 指定为测试环境`process.env.NODE_ENV = 'testing'`、生产环境：`process.env.NODE_ENV === 'production'`，这样以实现不同环境变量启用不同的配置

通过`webpack.DefinePlugin`定义的全局常量，只能在待编译的模块中使用，如`src/index.js`、`.vue`文件等，以实现对不同环境下构建产生不同行为,eg:

``` js
// src/index.js
if (process.env.NODE_ENV === 'development') {
  console.log('Development log')
}
```

因为其他如字体，媒体等资源的`options.name`配置都是统一的，我们**封装assetsPath函数**做来这件事：
新建`build/utils.js`,暴露`assetsPath`方法：

``` js
'use strict'
const path = require('path')
const config = require('../config')

exports.assetsPath = function (_path) {
  const assetsSubDirectory = process.env.NODE_ENV === 'production'
    ? config.build.assetsSubDirectory
    : config.dev.assetsSubDirectory
  // `path.posix` 属性提供了 path 方法针对 POSIX 的实现
  return path.posix.join(assetsSubDirectory, _path)
```

*Tip*：`path` 模块的默认操作会根据 Node.js 应用程序运行的操作系统的不同而变化。 比如，当运行在 Windows 操作系统上时，path 模块会认为使用的是 Windows 风格的路径。
比如，对 Windows 文件路径 `C:\temp\myfile.html` 使用 `path.basename()` 函数，运行在 POSIX 上与运行在 Windows 上会产生不同的结果，eg:

``` js
// 在 POSIX 上:
path.basename('C:\\temp\\myfile.html'); // 返回: 'C:\\temp\\myfile.html'

// 在 Windows 上:
path.basename('C:\\temp\\myfile.html'); // 返回: 'myfile.html'
```
要想在任何操作系统上处理 POSIX 文件路径时获得一致的结果，可以使用 `path.posix`(反之可以使用 `path.win32`)

``` js
// 在 POSIX 和 Windows 上
path.posix.basename('/tmp/myfile.html'); // 均返回: 'myfile.html'
```

**媒体文件、字体的`loader`配置类似，如下：**

``` js
{
  test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
  loader: 'url-loader',
  options: {
    limit: 10000,
    name: utils.assetsPath('media/[name].[hash:7].[ext]')
  }
},
{
  test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
  loader: 'url-loader',
  options: {
    limit: 10000,
    name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
  }
}
```