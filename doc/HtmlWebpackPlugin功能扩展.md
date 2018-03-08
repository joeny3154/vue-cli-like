HtmlWebpackPlugin功能扩展
======

该插件将为你生成一个HTML5文件，其中包括使用`script`标签的body中的所有webpack包。
如果你有任何`CSS assets` 在webpack的输出中（例如，利用`ExtractTextPlugin`提取CSS），那么这些将被包含在HTML `head`中的`<link>`标签内

``` js
const webpackConfig = merge(baseWebpackConfig, {
  // ...
  plugins: [
    // ...
    new HtmlWebpackPlugin({
      filename: config.build.index,
      template: 'index.html',
      inject: true,
      minify: {
        // 移除注释
        removeComments: true,
        // 去除空格和换行
        collapseWhitespace: true,
        // 尽可能移除属性中的引号和空属性
        removeAttributeQuotes: true
      },
      // 按照不同文件的依赖关系来排序
      chunksSortMode: 'dependency'
    }),
  ]
}
```

`minify`: 对`html`的压缩选项或者 false 。默认值为false, 由于`HtmlWebpackPlugin` 内部集成了 [`html-minifier`](https://github.com/kangax/html-minifier#options-quick-reference), 所以这个压缩选项同 `html-minify` 的压缩选项完全一样

``` js
minify: {
  removeComments: true, // 移除注释
  collapseWhitespace: true, // 去除空格和换行
  removeAttributeQuotes: true //移除属性中的引号 => <div class=example>test minify</div>
}
```


`inject`: 注入选项。有四个选项值 `true`, `body`, `head`, `false`

  1. true: `默认值，script` 标签位于html文件的 `body` 底部, 在`</body>`内部

  2. body: 同 `true`

  3. head: `script` 标签位于 `head` 标签内

  4. false: 不插入生成的 js 文件，只是单纯的生成一个 html 文件, 注意js抽离的`css bundle`也不会注入