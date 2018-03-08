

`npm i --save-dev uglifyjs-webpack-plugin`

这个插件使用 `UglifyJS` 去压缩你的JavaScript代码。除了它从 webpack 中解耦之外，它和 webpack 核心插件 (`webpack.optimize.UglifyJSPlugin`) 是同一个插件。这允许你控制你正在使用的 `UglifyJS` 的版本。

> 注意: webpack 在 `webpack.optimize.UglifyJsPlugin` 下包含相同的插件。对于那些想控制 `UglifyJS` 版本的开发者来说，这是一个独立的版本。

``` js
// ...
const webpackConfig = merge(baseWebpackConfig, {
  // ...
  plugins: [
    // ...
    new UglifyJsPlugin({
      uglifyOptions: {
        // 压缩
        compress: {
          warnings: false
        }
      },
      // 使用 SourceMaps 将错误信息的位置映射到模块。这会减慢编译的速度。
      sourceMap: config.build.productionSourceMap,
      // parallel: { Boolean | Number } 启用并行化。 为true时并发运行的默认数量：os.cpus().length - 1。
      parallel: true
    })
  ]
}
```