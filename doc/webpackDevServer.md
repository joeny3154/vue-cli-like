
使用webpack-dev-server搭建一个本地服务器
=======

`npm i webpack-dev-server webpack-merge --save-dev`

``` js
/* build/webpack.dev.conf.js */
const webpackBaseConf = require('./webpack.base.conf')
const merge = require('webpack-merge')

const devWebpackConf = merge(webpackBaseConf, {
  devServer: {
    host: 'localhost',
    port: 8080,
    publicPath: '/',
    open: true // 自动打开默认浏览器
  }
})
module.exports = devWebpackConf
```

注意：`publicPath` 配置为`/`后, html模块可以通过`/bundle_xxx.js`的方式引用到构建生成的bundle资源，比如：`<script src="/app.js"></script>`，如果改为 `publicPath: '/public'`, 则需要`<script src="/public/app.js"></script>`

# 配置npm脚本

在`scripts`选项中添加如下内容：

``` js
/* package.json */
"scripts": {
  "dev": "webpack-dev-server --inline --progress --config build/webpack.dev.conf.js"
}
```

项目根目录执行`npm run dev`启动本地服务器，同时在项目根目录添加`index.html`文件，通过script标签引入webpack打包生成的`app.js`文件

``` html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>vue-cli-like</title>
</head>
<body>
  <div>app</div>
  <script src="/app.js"></script>
</body>
</html>
```

如果浏览器能成功显示index.html，并且浏览器console能输出src/index.js内容，则构建成功

# 通过webpack生成html，并注入bundle资源

之前我们需要在`index.html`中手动注入bundle资源，这十分不便。并且我们知道webpack可以对资源加上`chunkhash`（如`app.c359174058dad2d7114f.js`的`c359174058dad2d7114f`部分，我们对`chunkhash`是会根据现在我们想通过webpack来完成这项工作：

安装HtmlWebpackPlugin插件`npm i html-webpack-plugin --save-dev`

在`webpack.dev.conf.js`添加如下配置

``` js
/* webpack.dev.conf.js */

const HtmlWebpackPlugin = require('html-webpack-plugin')

const devWebpackConf = merge(webpackBaseConf, {
  devServer: {
    host: 'localhost',
    port: 8080,
    publicPath: '/',
    open: true
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html', // 使用自己的提供的html模板
      inject: true
    })
  ]
})
```