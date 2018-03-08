
# 提取 chunks 之间共享的通用模块：`CommonsChunkPlugin`

CommonsChunkPlugin 插件，是一个可选的用于建立一个独立文件(又称作 chunk)的功能，这个文件包括多个入口 chunk 的公共模块。通过将公共模块拆出来，最终合成的文件能够在最开始的时候加载一次，便存到缓存中供后续使用。这个带来速度上的提升，因为浏览器会迅速将公共的代码从缓存中取出来，而不是每次访问一个新页面时，再去加载一个更大的文件。

###webpack`chunk`分类：分三种：`entry chunk`、`children chunk` 和 `commons chunk`

1. `entry chunk`: 入口文件（entry）也是 `chunk`

2. `children chunk`: 入口文件以及它的依赖文件里通过 `code split` 分离出来／创建的也是 `chunk`

3. `commons chunk`： `CommonsChunkPlugin` 创建的文件也是 `chunk`

**`CommonsChunkPlugin` 选项**：

- `name`: 这是 common chunk 的名称。已经存在的 chunk 可以通过传入一个已存在的 chunk 名称而被选择, name 可以是已经存在的 chunk 的 name （一般是入口文件），那么共用模块代码会合并到这个已存在的 chunk；否则，创建名字为 name 的 commons chunk 来合并。

- `filenames`: `common chunk` 的文件名模板。
可以使用与`output.filename` 配置项中相同的占位符。
如果被忽略，原本的文件名不会被修改(通常是 `output.filename` 或者 `output.chunkFilename`配置项生成的文件名)。
如果您也使用`options.async`，则不允许使用此选项

- `chunks`: 指定 source chunks，即从哪些 chunk 去查找共用模块。省略 chunks 选项时，默认为所有 entry chunks。

- `minChunks`: 

模块必须被 n 个入口chunk 共享， 传入一个 `function` ，以添加定制的逻辑（默认是 chunk 的数量）,传入 `Infinity` 会马上生成 公共chunk，但里面没有模块。
1. 设定为数字（数量必须大于等于2，或者少于等于 chunks的数量），指定共用模块被多少个 chunk 使用才能被合并。
2. 设为函数，添加定制的逻辑, 接受 module, count 两个参数, `function(module, count) -> boolean`。
3. 特别地，还可以设置为 Infinity ，即创建 commons chunk 但不合并任何共用模块。这时一般搭配 entry 的配置一起用：

``` js
entry: {
    vendor: ["jquery", "other-lib"],
    app: "./entry"
  }
  new webpack.optimize.CommonsChunkPlugin({
    name: "vendor",
    // filename: "vendor.js"
    // (Give the chunk a different name)
    minChunks: Infinity,
    // (with more entries, this ensures that no other module
    //  goes into the vendor chunk)
  })
```

- `children`: 使用代码拆分功能，一个 chunk 的多个子 chunk 会有公共的依赖。为了防止重复，此项可以将子 chunk的公共模块移入父 chunk。这会减少总体的大小，但会对首次加载时间产生不良影响。如果设置为 `true`，所有  公共chunk 的子模块都会被选择。

``` js
new webpack.optimize.CommonsChunkPlugin({
  // names: ["app", "subPageA"]// 选择 chunks，或者忽略该项设置以选择全部 chunks

  children: true, // 选择所有被选 chunks 的子 chunks

  // minChunks: 3, // 在提取之前需要至少三个子 chunk 共享这个模块
})
```

- `async`: 异步加载的 额外公共chunk(异步的`common chunk`)。当下载异步chunk时，异步的`common chunk`将自动并行下载。

如果设置为 `true`，一个异步的 `common chunk` 会作为 `options.name` 的子模块，和 `options.chunks` 的兄弟模块被创建。它会与 `options.chunks` 并行被加载。
如果此处不为`true`， 可以提供字符串来更改输出文件的名称，而不是使用`option.filename`去改输出文件的名称。

``` js
new webpack.optimize.CommonsChunkPlugin({
  name: "app",
  // or
  names: ["app", "subPageA"]
  // the name or list of names must match the name or names
  // of the entry points that create the async chunks
  children: true,
  // (选择所有被选 chunks 的子 chunks)
  async: true,
  // (创建一个异步 公共chunk)
  minChunks: 3,
  // (在提取之前需要至少三个子 chunk 共享这个模块)
})
```

1. 将 vendor js （第三方库）分割成提取到独立的chunk

这里讲两种方案：

**第一种：webpack 官方示例方案**：明确指定第三方库`chunk`，并保证没其它的模块会打包进 `vendor chunk`中, eg:

``` js
entry: {
  // 明确指定第三方库`chunk`
  vendor: ["jquery", "other-lib"],
  app: "./entry"
},
plugins: [
  new webpack.optimize.CommonsChunkPlugin({
    name: "vendor",
    // 随着 entry chunk 越来越多，这个配置保证没其它的模块会打包进 vendor chunk
    minChunks: Infinity,
  })
]
```

*Tip:* `minChunks: Infinity`的作用示例解释是："随着 `entry chunk` 越来越多，这个配置保证没其它的模块会打包进 `vendor chunk`"。
这句话如何理解：因为现在的配置除了`vendor chunk`外只有一个入口`chunk`,即 `app chunk`，也就是使用的模块都只可能被 1 个入口chunk（即`app chunk`） 共享，这导致数量不足2所以不会被`CommonsChunkPlugin`提取到`vendor chunk`中, 但随着`entry chunk`越来越多，其他`entry chunk`可能与`app chunk` 或者其他`entry chunk`之间会存在共享的模块，这时候这些`模块`会被n 个入口chunk 共享，这时候这些共享的模块就会被提取到`vendor chunk`中，导致`vendor chunk`越来越大，不仅仅包含我们明确指定第三方库，这不是我们希望的，而设置`minChunks: Infinity`可以解决问题

**第二种：vue-cli 中使用的方案：**

因为`CommonsChunkPlugin`配置中`name`选项如果传入已经存在的 chunk，被`CommonsChunkPlugin`提取的共享模块就会提取到已存在的chunk, 因此我们可以先在`entry`定义一个chunk为 `vendor`。eg:

``` js
// webpack.base.conf.js
entry: {
  vendor: ['vue', 'vuex'],
  app: "./index"
},
```

`CommonsChunkPlugin`配置中`chunks`选项可以选择 chunks 的来源, 如果我们不忽略它，所有的 入口chunk (entry chunk) 都会被选择。
我们做如下配置，使得被 `require` 的模块如果存在于 `node_modules` (即代表第三方库) 都提取到 `vendor` chunk 中，对所有的 入口chunk (entry chunk)生效。eg:

``` js
// webpack.prod.conf.js
new webpack.optimize.CommonsChunkPlugin({
  name: 'vendor',
  // minChunks 默认是设置 chunk 的数量。数量必须大于等于2，或者少于等于 chunks 的数量，minChunks: n 即表示被 require 的模块必须被 n 个入口 chunk 共享才会被提取
  // 如果传入一个 function ，可以添加定制逻辑（默认是 chunk 的数量）
  minChunks (module) {
    return (
      module.resource &&
      /\.js$/.test(module.resource) &&
      module.resource.indexOf(
        path.join(__dirname, '../node_modules')
      ) === 0
    )
  }
})
```


**`chunkhash`不稳定的问题**

完成以上步骤后, webpack 构建后可以发现业务模块（`app.[chunkhash].js`）将明显减小，因为第三方库都提交到`vendor.[chunkhash].js`中。
但存在一个问题：当更改业务代码时，重新构建后业务模块（`app.[chunkhash].js`）的`chunkhash`毋庸置疑的改变了，但`vendor.[chunkhash].js`的`chunkhash`也随着改变了，尽管 `vendor` 的内容没有实质变化，这不利于客户端的资源缓存，我们只希望改变的模块的`chunkhash`改变。

`chunkhash`改变的原因：

因为 webpack 在入口 chunk 中，包含了某些样板(boilerplate)，特别是 `runtime` 和 `manifest`。（样板(boilerplate)指 webpack 运行时的引导代码）

1. runtime 代码

- 全局 `webpackJsonp` 方法：模块读取函数，用来区分模块是否加载，并调用 `__webpack_require__` 函数；

- 私有 `__webpack_require__` 方法：模块初始化执行函数，并给执行过的模块做标记；

- 异步 chunk 加载函数（用 script 标签异步加载），加载的 chunk 内容均被 webpackJsonp 包裹的，script 加载成功会直接执行。这个函数还包含了所有生成的 chunks 的路径。在 webpack 2 中这个函数用到了 Promise，因此可能需要提供 Promise Polyfill；

- 对 ES6 Modules 的默认导出（`export default`）做处理。

2. manifest 模块清单

``` js
script.src = __webpack_require__.p + "static/js/" + chunkId + "." + {"0":"4970f5e7e95c23dcfa7f","1":"8f138e48ba22ff687fa1"}
[chunkId] + ".js";
```

`{"0":"4970f5e7e95c23dcfa7f","1":"8f138e48ba22ff687fa1"}`是以`chunkId`为`key`和`chunkhash`为`value`组成的一个对象, 业务代码的改变可能导致`chunkId`的分配改变，也可能只导致chunk对应的chunkhash改变，但结果都会导致整个`runtime`代码的更改。

如果没有使用`CommonsChunkPlugin`, webpack 的`runtime`代码会存在于每个chunk 中，如果使用了`CommonsChunkPlugin` 默认会打包到由`CommonsChunkPlugin`生成的最后一个chunk中（如果我们不使用`name`选项，使用`names: []`， 即会打包到末尾的 `chunk` 中），所以我们只需要在抽离vender chunk后，再使用`CommonsChunkPlugin`提取一个`manifest` chunk(不一定要命名为`manifest`, 指定 `entry` 配置中未用到的名称即可)。eg:


``` js
// webpack.prod.conf.js

new webpack.optimize.CommonsChunkPlugin({
  name: 'vendor',
  // minChunks 默认是设置 chunk 的数量。数量必须大于等于2，或者少于等于 chunks 的数量，minChunks: n 即表示被 require 的模块必须被 n 个入口 chunk 共享才会被提取
  // 如果传入一个 function ，可以添加定制逻辑（默认是 chunk 的数量）
  minChunks (module) {
    return (
      module.resource &&
      /\.js$/.test(module.resource) &&
      module.resource.indexOf(
        path.join(__dirname, '../node_modules')
      ) === 0
    )
  }
}),
new webpack.optimize.CommonsChunkPlugin({
  name: 'manifest',
  minChunks: Infinity
}),
```

这样一来虽然每次`mainifest`chunk都会变，但`vendor`可以更好的被缓存，并且`manifest.js` 实在是太小了，这样做的收益更高。

*Tip*: 
1. `manifest`的命名并不是固定的，可以指定其他命名，通常使用 `"runtime"/"manifest"`；
2. `minChunks` 为 `Infinity` 时，就是单纯创建这个文件, 里面包含webpack runtime代码和模块清单，不会合并任何其他共用模块

### 将 `manifest.js`写入到 html

你可能发现了一个问题 —— manifest.js 实在是太小了，以至于不值得再为一个小 js 增加资源请求数量。
因此我们可以引入另一个插件：`inline-manifest-webpack-plugin`。

它可以将 manifest 转为内联在 html 内的 inline script。因为 manifest 经常随着构建而变化，写入到 html 中便不需要每次构建再下载新的 manifest 了，从而减少了一个小文件请求。此插件依赖 html-webpack-plugin 和 manifest 公共块，因此我们要配置 HtmlWebpackPlugin 且保持 manifest 的命名

# 提取`children chunk`中的`common chunk`

使用代码拆分功能，一个 chunk 的多个子 chunk 会有公共的依赖。为了防止重复，可以将这些公共模块移入父 chunk。这会减少总体的大小，但会对首次加载时间产生不良影响。

``` js
new webpack.optimize.CommonsChunkPlugin({
  children: true, // 设置为 `true`，所有  公共chunk 的子模块都会被选择
}),
```

# 异步加载`children chunk`中的`common chunk`

与上面的类似，但是并非将公共模块移动到父 chunk（增加初始加载时间），而是使用新的异步加载的额外公共chunk。当下载额外的 chunk 时，它将自动并行下载。

这个实例从代码拆分块(`code splitted chunks`)中提取共享块并bundles它们在一个单独的块中，类似于 `vendor chunk`

``` js
new webpack.optimize.CommonsChunkPlugin({
  name: 'app', 
  async: 'vendor-async', 
  children: true, // 设置为 `true`，所有  公共chunk 的子模块都会被选择
  minChunks: 3 // 在提取之前需要至少三个子 chunk 共享这个模块
}),
```
