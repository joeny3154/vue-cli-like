NoEmitOnErrorsPlugin
=====

``` js
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
  // 1. 在编译出现错误时，使用 NoEmitOnErrorsPlugin 来跳过输出阶段。这样可以确保输出资源不会包含错误。
  // 2. 如果你在使用 CLI(命令行界面command-line interface)，启用此插件后，webpack 进程遇到错误代码将不会退出。
  new webpack.NoEmitOnErrorsPlugin(), 
]
```