
在`module.rules`中添加`ExtractTextPlugin`配置，eg：
``` js
// webpack.prod.conf.js
const ExtractTextPlugin = require('extract-text-webpack-plugin')

// ...
const webpackConfig = merge(baseWebpackConfig, {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          use: [
            { loader: 'css-loader', options: { sourceMap: config.build.productionSourceMap } },
            { loader: 'postcss-loader', options: { sourceMap: config.build.productionSourceMap } }
          ],
          fallback: 'vue-style-loader'
        })
      },
      {
        test: /\.less$/,
        use: ExtractTextPlugin.extract({
          use: [
            { loader: 'css-loader', options: { sourceMap: config.build.productionSourceMap } },
            { loader: 'postcss-loader', options: { sourceMap: config.build.productionSourceMap } },
            { loader: 'less-loader', options: { sourceMap: config.build.productionSourceMap } }
          ],
          fallback: 'vue-style-loader'
        })
      },
    ]
  },
  // ...
}

```

完成上面步骤还不能抽离CSS, 需要在`plugins`选项添加`ExtractTextPlugin`插件，eg:

``` js
// webpack.prod.conf.js

plugins: [
  new ExtractTextPlugin({
    filename: utils.assetsPath('css/[name].[contenthash].css'),
    // 如果你想从codesplit chunks(代码片段)中提取CSS到这个main(主要)的CSS文件，那么把下面的选项设置为`true`。 这将导致你的应用程序的所有CSS被预先加载。
    allChunks: false,
  }),
]
```

以上步骤完成只是对独立的`*.css`、`*.less`做了css抽离，`*.vue`中的样式还是通过`<style>`插入到`html`的 `head`中, 需要对`build/webpack.base.conf.js`做如下更改：

``` js
const isProduction = process.env.NODE_ENV === 'production'
const sourceMapEnabled = isProduction ? config.build.productionSourceMap : config.dev.cssSourceMap
{
  test: /\.vue$/,
  loader: 'vue-loader',
  options: {
    // hotReload: false,
    loaders: {
      css:  ExtractTextPlugin.extract({
        use: [
          { loader: 'css-loader', options: { sourceMap: sourceMapEnabled } }
        ],
        fallback: 'vue-style-loader' // <- 这是vue-loader的依赖，所以如果使用npm3，则不需要显式安装
      }),
      less: ExtractTextPlugin.extract({
        use: [
          { loader: 'css-loader', options: { sourceMap: sourceMapEnabled } },
          { loader: 'less-loader', options: { sourceMap: sourceMapEnabled } }
        ],
        fallback: 'vue-style-loader'
      }),
      // ...
    },
    // ...
  }
},
```
这样我就实现了`*.vue`中的样式抽离，但这样写会影响开发环境的`webpack.dev.conf.js`配置，因为`webpack.base.config.js`是生产和开发通用的配置
所以我们需要动态实现`vue-loader`的配置。在此之前，我们先比较一下两种环境下我们需要的`vue-loader` 配置：

``` js
// 开发环境：production
{
  test: /\.vue$/,
  loader: 'vue-loader',
  options: {
    loaders: {
      css: ['vue-style-loader',
        { loader: 'css-loader', options: { sourceMap: sourceMapEnabled } }
      ],
      // ...
    },
    // ...
  }
}


// 生产环境

{
  test: /\.vue$/,
  loader: 'vue-loader',
  options: {
    loaders: {
      css:  ExtractTextPlugin.extract({
        use: [
          { loader: 'css-loader', options: { sourceMap: sourceMapEnabled } }
        ],
        fallback: 'vue-style-loader'
      }),
      // ...
    },
    // ...
  }
}

```

发现我们需要动态生成的是`options.loaders`配置， 所以我们先封装`cssLoaders`方法用于动态生成`loaders`, 我们把这个方法写到`build/utils`模块并暴露出来.

我们希望如此设计这个函数：`cssLoaders({sourceMap: boolean, extract: boolean, usePostCSS: boolean})`，调用者可根据不同环境设定`sourceMap`、`extract` 和 `usePostCSS`的值，代码如下：

``` js
exports.cssLoaders = function (options) {
  options = options || {}
  const cssLoader = {
    loader: 'css-loader',
    options: {
      sourceMap: options.sourceMap
    }
  }

  const postcssLoader = {
    loader: 'postcss-loader',
    options: {
      sourceMap: options.sourceMap
    }
  }

  function generateLoaders (loader, loaderOptions) {
    // 设置默认loader
    const loaders = options.usePostCSS ? [cssLoader, postcssLoader] : [cssLoader]

    if (loader) {
      loaders.push({
        loader: loader + '-loader',
        options: Object.assign({}, loaderOptions, {
          sourceMap: options.sourceMap
        })
      })
    }

    if (options.extract) {
      return ExtractTextPlugin.extract({
        use: loaders,
        fallback: 'vue-style-loader'
      })
    } else {
      return ['vue-style-loader'].concat(loaders)
    }
  }
  return {
    css: generateLoaders(),
    postcss: generateLoaders(),
    less: generateLoaders('less'),
    sass: generateLoaders('sass', { indentedSyntax: true }),
    scss: generateLoaders('sass'),
    stylus: generateLoaders('stylus'),
    styl: generateLoaders('stylus')
  }
}
```

实现了`cssLoaders`方法，我们创建`build/vue-loader.conf.js`模块并暴露完整的`vue-loader`的配置，eg:



``` js
'use strict'
const utils = require('./utils')
const config = require('../config')
const isProduction = process.env.NODE_ENV === 'production'
const sourceMapEnabled = isProduction ? config.build.productionSourceMap

module.exports = {
  loaders: utils.cssLoaders({
    sourceMap: sourceMapEnabled,
    extract: isProduction
  }),
  cssSourceMap: sourceMapEnabled,
  // cacheBusting: config.dev.cacheBusting,
  transformToRequire: {
    video: ['src', 'poster'],
    source: 'src',
    img: 'src',
    image: 'xlink:href'
  }
}
```

`vue-loader`的配置现在独立成模块并动态生成配置，其实对于`*.css`、`*.less`等的loader配置也需要改变，原因主要是由于`*.vue`中的样式处理 和 单独的样式文件的样式处理 需要一致，还有就是`*.css`、`*.less`的配置抽象成由统一函数生成更方便维护和配置调整。

所以接下来我们 **为独立样式文件生成装载器（`.vue`文件除外）**

我们先对比`webpack.prod.conf.js` 和 `webpack.dev.conf.js` 中对独立样式文件的`loader`配置

``` js
// webpack.dev.conf.js
module: {
  rules: [
    {
      test: /\.css$/,
      use: ExtractTextPlugin.extract({
        use: [
          { loader: 'css-loader', options: { sourceMap: config.build.productionSourceMap } },
          { loader: 'postcss-loader', options: { sourceMap: config.build.productionSourceMap } }
        ],
        fallback: 'vue-style-loader'
      })
    },
    {
      test: /\.less$/,
      use: ExtractTextPlugin.extract({
        use: [
          { loader: 'css-loader', options: { sourceMap: config.build.productionSourceMap } },
          { loader: 'postcss-loader', options: { sourceMap: config.build.productionSourceMap } },
          { loader: 'less-loader', options: { sourceMap: config.build.productionSourceMap } }
        ],
        fallback: 'vue-style-loader'
      })
    },
    // ...
  ]
},

// webpack.prod.conf.js
module: {
  rules: [
    {
      test: /\.css$/,
      use: [
        { loader: 'vue-style-loader' },
        { loader: 'css-loader', options: { sourceMap: config.build.cssSourceMap } },
        { loader: 'postcss-loader', options: { sourceMap: config.build.cssSourceMap } }
      ]
    },
    {
      test: /\.less$/,
      use:[
        { loader: 'vue-style-loader' },
        { loader: 'css-loader', options: { sourceMap: config.build.cssSourceMap } },
        { loader: 'postcss-loader', options: { sourceMap: config.build.cssSourceMap } },
        { loader: 'less-loader', options: { sourceMap: config.build.cssSourceMap } }
      ]
    },
    // ...
  ]
},
```

显然想生成如上的配置，我们只需要借助`cssLoaders`方法返回的 `loaders` 对象，遍历此对象的key，每次遍历中生成一个带有`test`和`use`属性的对象即可获得对应了`loader`配置, eg:

``` js
exports.styleLoaders = function (options) {
  const output = []
  const loaders = exports.cssLoaders(options)

  for (const extension in loaders) {
    const loader = loaders[extension]
    output.push({
      test: new RegExp('\\.' + extension + '$'),
      use: loader
    })
  }

  return output
}
```

`webpack.dev.conf.js` 和 `webpack.prod.conf.js` 做如下更改：

``` js
// webpack.dev.conf.js
module: {
  rules: utils.styleLoaders({ sourceMap: config.dev.cssSourceMap, usePostCSS: true })
},
```

``` js
// webpack.prod.conf.js
module: {
  rules: utils.styleLoaders({
    sourceMap: config.build.productionSourceMap,
    extract: true,
    usePostCSS: true
  })
},
```

# 压缩提取出来的CSS: `OptimizeCSSPlugin`

我们可以发现`build`之后CSS虽然已经抽离成独立的css文件中，但还存在两个问题：

1. 没有被压缩，体积过大。

2. 还有`extract-text-webpack-plugin`处理CSS时，可能出现重复条目。首先指出同一个入口模块及其子模块`import`同样的**样式文件**并不会出现bundle中存在重复的模块内容，存在重复条目指的是不同的样式文件中可能存在同样的条目，比如两个css文件中都有`.clearfix { ... }`,使用`extract-text-webpack-plugin` 来bundles CSS后，bundle 就会出现重复的`.clearfix { ... }`条目。

这些都可以使用`optimize-css-assets-webpack-plugin`插件来解决：

``` js
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
// ...
const webpackConfig = merge(baseWebpackConfig, {
  // ...
  plugins: [
    // ...
    new OptimizeCSSPlugin({
      // 文件压缩后需要生成 map 文件
      cssProcessorOptions: config.build.productionSourceMap
        ? { safe: true, map: { inline: false } }
        : { safe: true }
    })
  ]
}
```