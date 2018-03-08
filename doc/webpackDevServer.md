`npm i webpack --save-dev`

1、webpack基础配置

``` js
/* build/webpack.base.conf.js */

const path = require('path')

module.exports = {
  entry: {
    app: './src/index.js'
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: '[name].js',
    publicPath: '/'
  }
}
```

同时在`src`目录下添加`index.js`作为入口js, 写入`console.log('success')`供后续测试是否搭建成功使用

Tip: `publicPath`, 默认的是`/`。一般都通过绝对路径配置，不采用相对路径，具体如何配置呢？eg:
假如某资源`bundle`后的生成路径是`static/js/*.js`，上传服务器后发现....

1. 如果能用`http://www.xxx.com/static/js/xxx.js`路径访问到时, 那么`publicPath`就是`/`无需修改；
2. 如果需要用`http://www.xxx.com/a/b/static/js/xxx.js`路径才能访问到时, 那`publicPath`需要修改为`/a/b/`, 然后重新 `build` 一次, 上传到服务器
3. 当你把静态文件传到`cdn`, 需要用`http://stacic.yyy.com/aaa/bbb/static/js/xxx.js`路径才能访问到, 那么`publicPath`需要修改为`http://stacic.yyy.com/aaa/bbb/`, 然后重新 `build`一次, 上传到服务器

2、webpack 测试环境配置

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

注意：`publicPath` 配置为`/`后, html模块可以通过`/bundle_xxx.js`的方式引用到构建生成的bundle资源，比如：`<script src="/app.js"></script>`，如果改为 `publicPath: '/public'`, 则需要`<script src="/public、app.js"></script>`

3. 配置npm脚本

在`scripts`选项中添加如下内容：

``` js
/* package.json */

// ...
"scripts": {
  "dev": "webpack-dev-server --inline --progress --config build/webpack.dev.conf.js"
}
// ...
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

# 通过webpack构建html，并注入bundle资源

之前我们需要在index.html中手动注入bundle资源，现在我们想通过webpack来完成这项工作：

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