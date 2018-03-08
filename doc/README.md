
从0开始搭建vue-cli
======

# 初始化项目

终端cd到项目根目录，执行`npm init`，一路回车即可，生成`package.json`文件

# [使用webpack-dev-server构建本地服务器](./webpackDevServer.md)

# [使用 Babel 编译js](./Babel使用.md)

# [配置全局常量](./全局常量配置及其使用.md)

# [eslint 配置](./配置eslint.md)

# [编译 vue 文件](./vue-loader配置.md)

# [postcss配置及其扩展](./postcss配置及其扩展.md)

# [图片、媒体资源、字体等loader配置](./常用loader配置.md)

# [启用热替换模块(Hot Module Replacement)](./启用热替换模块.md)

# [NoEmitOnErrorsPlugin](./NoEmitOnErrorsPlugin.md)

# [Source Maps配置](./SourceMaps.md)

# [自动检索可用端口](./自动检索可用端口.md)

# [生产环境 webpack 配置](./生产环境webpack基础配置.md)

# [抽离CSS](./抽离CSS.md)

# [提取chunks之间共享的通用模块](./提取chunks之间共享的通用模块.md)

# [保证`vender chunk`稳定](./HashedModuleIdsPlugin.md)

# [作用域提升提升js执行速度](./ModuleConcatenationPlugin使用.md)

# [丰富`HtmlWebpackPlugin`功能](./HtmlWebpackPlugin功能扩展.md)

# [压缩你的JavaScript代码](./压缩JavaScript代码.md)

# [拷贝`static`资源](./静态资源管理.md)
        
# [启动gzip压缩](./gzip压缩.md)

# [可视化分析包的尺寸](./可视化分析包的尺寸.md)

# [版本管理](./版本管理.md)



====================================================================

# 补充配置

### `vue-loader` 其他基本配置

1. CSS `source maps`

是否开启 CSS 的 `source maps`，关闭可以避免 `css-loader` 的 some relative path related bugs 同时可以加快构建速度。
注意，这个值会在 webpack 配置中没有 `devtool` 的情况下自动设置为 false。

2. `transformToRequire`

``` js
const isProduction = process.env.NODE_ENV === 'production'
const sourceMapEnabled = isProduction ? config.build.productionSourceMap : config.dev.cssSourceMap
{
  test: /\.vue$/,
  loader: 'vue-loader',
  options: {
    loaders: {
      css: [
        'vue-style-loader',
        { loader: 'css-loader', options: { sourceMap: false } }
      ]
    }
    // 是否开启 CSS 的 source maps，关闭可以避免 css-loader 的 一些相对路径相关的错误（some relative path related bugs），同时可以加快构建速度。
    // 注意，这个值会在 webpack 配置中没有 devtool 的情况下自动设置为 false。
    cssSourceMap: sourceMapEnabled,
    // cacheBusting: config.dev.cacheBusting,
    // 在模版编译过程中，编译器可以将某些属性，如 src 路径，转换为 require 调用，以便目标资源可以由 webpack 处理。
    // 默认配置会转换 <img> 标签上的 src 属性和 SVG 的 <image> 标签上的 xlink：href 属性。即默认值: { img: 'src', image: 'xlink:href' }
    transformToRequire: {
      video: ['src', 'poster'],
      source: 'src',
      img: 'src',
      image: 'xlink:href'
    }
  }
}
```


**npm配置变量:** config

npm 脚本还可以通过npm_config_前缀，拿到 npm 的配置变量，即npm config get xxx命令返回的值。比如，当前模块的发行标签，可以通过npm_config_tag取到。

"view": "echo $npm_config_tag",

注意，package.json里面的config对象，可以被环境变量覆盖。

{ 
  "name" : "foo",
  "config" : { "port" : "8080" },
  "scripts" : { "start" : "node server.js" }
}

`npm_package_config_port`变量返回的是 `8080`。这个值可以用下面的方法覆盖。

eg: 覆盖**配置变量**

```
$ npm config set foo:port 80
```

最后，env命令可以列出所有环境变量: `"env": "env"`