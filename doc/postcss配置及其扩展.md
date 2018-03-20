
配置 postcss 及其 扩展
======

vue-loader 内部通过 PostCSS 处理其样式, 如果没有添加 PostCSS 扩展， vue-loader 只会进行默认 的简单的 PostCSS 转换。

添加`PostCSS`扩展可以有以下 2 种方式, 详情可查看[这里](https://vue-loader.vuejs.org/zh-cn/features/postcss.html)

方法1. vue-loader 的 `options.loaders` 选项中添加 `postcss`选项

``` js
{
  test: /\.vue$/,
  loader: 'vue-loader',
  options: {
    loaders: {
      // ...
      postcss: ['vue-style-loader',
        { loader: 'css-loader', options: { sourceMap: sourceMapEnabled } }
      ]
    }
  }
}
```

方法2. vue-loader 的 `options` 中添加 `postcss`选项

``` js
{
  test: /\.vue$/,
  loader: 'vue-loader',
  // `vue-loader` 选项放这里
  options: {
    // ...
    postcss: {
      plugins: [...], // 插件列表
      options: {
        parser: 'sugarss' // 使用 sugarss 解析器
      }
    }
  }
}
```

不过我们不使上述两种，而采用使用配置文件的方式。

因为**使用配置文件允许你在由 postcss-loader 处理的普通CSS文件 和 `*.vue` 文件中的 CSS 之间共享相同的配置**，这是推荐的做法:

# 实现`*.vue` 文件的 postcss 扩展配置

`vue-loader` 会自动加载 postcss 配置文件(无需在样式块上指定 lang="postcss"),支持这些配置文件：
`postcss.config.js`、`.postcssrc`、`package.json` 中的 `postcss`
如果你希望针对 `*.vue` 文件中的 `<style>` 做特殊的配置（为了与普通CSS文件处理区分开），那么就把这些配置写在 vue-loader 配置的 `postcss` 字段里，即 inline options；如果你不希望 postcss 配置文件生效，我们还有一个 `useConfigFile: false` 配置项作为补充。

新建`postcss.config.js`, 添加`autoprefixer`插件以实现自动补充兼容前缀的功能：

``` js
module.exports = {
  "plugins": {
    // to edit target browsers: use "browserslist" field in package.json
    "autoprefixer": {}
  }
}
```

同时在package.json 中添加 `browserslist`属性指定需要兼容的环境列表。

``` json
"browserslist": [
  "> 1%",
  "last 2 versions",
  "not ie <= 8"
]
```

重新运行后就可以发现已经成功的添加了兼容:

``` css
 -webkit-box-sizing: border-box;
  box-sizing: border-box;
```

`.vue`文件中的`style`可以添加`src`来指定外部样式文件，我们可以发现一样成功的使用了`autoprefixer`, eg:

``` html
<style lang="less" src="./assets/styles/app.less"></style>
```

需要注意的是 `src` 导入遵循和 `require()` 一样的规则,这意味着你相对路径需要以 ./ 开始，你还可以从 NPM 包中直接导入资源，eg:

``` html
<!-- import a file from the installed "todomvc-app-css" npm package -->
<style src="todomvc-app-css/index.css">
```

在 13.6.0+ 版本中，自动加载 PostCSS 配置文件可以通过指定 `postcss.useConfigFile: false` 来禁用，eg：

``` js
{
  test: /\.vue$/,
  loader: 'vue-loader',
  // `vue-loader` 选项放这里
  options: {
    // ...
    postcss: {
      useConfigFile: false,
      plugins: [/* ... */],
      options: {/* ... */}
    }
  }
}
```



由于开发环境和生产环境对于css的处理方式不相同，我们先以开发环境下的配置为例

还记得我们之前说过**使用配置文件允许你在由 postcss-loader 处理的普通CSS文件 和 `*.vue` 文件中的 CSS 之间共享相同的配置**。
所以我们配置单独普通CSS文件的loader时，使用`postcss-loader`即可实现统一样式的处理。

在`webpack.dev.config.js`添加如下内容：

``` js
module: {
  rules: [
    // 支持 import '**/*.css' or require('**/*.css')
    {
      test: /\.css$/,
      use: [
        { loader: 'vue-style-loader' },
        { loader: 'css-loader'},
        // 这里是重点
        { loader: 'postcss-loader'}
      ]
    },
    {
      test: /\.less$/,
      use:[
        { loader: 'vue-style-loader' },
        { loader: 'css-loader' },
        { loader: 'postcss-loader' },
        { loader: 'less-loader' }]
    },
  ]
},
```

`style-loader` 提取打包进js中的css代码，并通过 `<style>` 标签动态加入文档的 `<head>` 中，`vue-style-loader`是类似功能！

less、sass、stylus、postcss等基本相似，配置方式如下：

``` js
module: {
  rules: [
    {
      test: /\.css$/,
      use: [
        { loader: 'vue-style-loader' },
        { loader: 'css-loader'},
        // 这里是重点
        { loader: 'postcss-loader'}
      ]
    },
    {
      test: /\.less$/,
      use:[
        { loader: 'vue-style-loader' },
        { loader: 'css-loader' },
        { loader: 'postcss-loader' },
        { loader: 'less-loader' }]
    },
    {
      test: /\.sass$/,
      use: [
        { loader: 'vue-style-loader' },
        { loader: 'css-loader' },
        { loader: 'postcss-loader' },
        { loader: 'sass-loader' } }
      ]
    },
    {
      test: /\.stylus$/,
      use: [
        { loader: 'vue-style-loader' },
        { loader: 'css-loader' },
        { loader: 'postcss-loader' },
        { loader: 'stylus-loader' }
      ]
    },
  ]
},
```

PostCSS 默认不解析 `@import`, 需要添加`postcss-import`以支持。

你可能已经发现不管是普通`*.css`文件还是`*.vue`组件中使用了`@import` ，被`@import`的样式默认都不被PostCSS解析，比如你对postcss配置扩展了`autoprefixer`功能，被`@import`的css并没有添加兼容前缀。

你可以手动配置 `postcss-import` 插件来解决这个问题：安装`postcss-import`并在postcss配置文件的`plugins`项添加`postcss-import`, eg：

``` js
module.exports = {
  "plugins": {
    "postcss-import": {},
    "autoprefixer": {}
  }
}
```

[postcss-import 详细配置](https://github.com/postcss/postcss-import)

*vue 本身支持 `<style src="...">`的，可以实现类似`@import`功能，此插件也可不用。*

如果`.vue`文件中`<style>` 标签的`lang`属性设置为`less`、`sass`等时，你会发现被`@import`的文件被PostCSS解析了，这是因为less等预处理器默认支持并能解析`@import`语法，相当于合并成一个文件交由PostCSS处理。

``` html
<style lang="less">
  @import '**/*.less';
</style>
```