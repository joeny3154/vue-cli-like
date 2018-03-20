
webpack基础配置
=======

在`build/webpack.base.conf.js`添加webpack的基础配置。

首先配置`entry`、`output`选项，我们的目标是把`dist`目录作为输出目录，所有静态资源存放到`dist/static`目录下, 后面还会有如images/fonts等bundle资源，所以资源可按类别区分文件夹存放。

``` js
/* build/webpack.base.conf.js */
const assetsSubDirectory = 'static'
const assetsPath = function (_path) {
  return path.join(assetsSubDirectory, _path)
}

module.exports = {
  entry: {
    app: './src/index.js'
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: assetsPath('js/[name].js'),
    publicPath: '/'
  }
}
```

`publicPath`, 默认的是`/`。通常都都配置为绝对路径，具体如何配置还取决于服务器静态资源的目录指向，例如：

上述配置js资源打包后生成的路径是`dist/static/js/[name].js`，上传服务器后如果能用`http://www.xxx.com/static/js/xxx.js`访问, `publicPath`就是`/`无需修改；如果需要用`http://www.xxx.com/a/b/static/js/xxx.js`访问, 那`publicPath`需要修改为`/a/b/`；如果把静态文件传到`cdn`, 需要用`http://stacic.yyy.com/aaa/bbb/static/js/xxx.js`路径才能访问到, 那么`publicPath`需要修改为`http://stacic.yyy.com/aaa/bbb/`