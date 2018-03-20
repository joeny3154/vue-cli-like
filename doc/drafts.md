
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

path.posix.join


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