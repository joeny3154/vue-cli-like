开发环境与开发环境需要使用不同的SourceMaps方案，所以配置到`config/index.js` 中，

``` js
// config/index.js
module.exports = {
  dev: {
    // ...
    devtool: 'eval-source-map',
  },
  build: {
    // ...
    devtool: '#source-map',
  }
}
```

``` js
// webpack.dev.conf.js
devtool: config.dev.devtool,
```

两者区别如下：

开发环境(development): `eval-source-map`, 行数能够正确映射，因为会映射到原始代码中；
生产环境（production）：`#source-map`, 生成完整的 SourceMap，输出为独立文件，在 `bundle` 中添加了 SourceMap 引用注释

webpack `devtool`配置查看这里：[官方文档](https://doc.webpack-china.org/configuration/devtool/#devtool)，
看不懂英文的[看这里](http://www.css88.com/doc/webpack2/configuration/devtool/)