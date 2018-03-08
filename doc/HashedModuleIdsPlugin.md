`HashedModuleIdsPlugin`保持`module.id`稳定
======

让我们向项目中再添加一个模块 `print.js`：

``` js
export default function print(text) {
  console.log(text);
};

```

``` js
// src/index.js
import Print from './print';
Print('test')
```

再次运行构建，然后我们期望的是，只有 `main bundle` 的 `hash` 发生变化，然而我们可以看到这三个文件的 `hash` 都变化了。这是因为每个 `module.id` 会基于默认的解析顺序(resolve order)进行增量。也就是说，当解析顺序发生变化，ID 也会随之改变。因此，简要概括:

- `main bundle` 会随着自身的新增内容的修改，而发生变化。

- `vendor bundle` 会随着自身的 `module.id` 的修改，而发生变化。

- `manifest bundle` 会因为当前包含一个新模块的引用，而发生变化


第一个和最后一个都是符合预期的行为, 而 vendor 的 hash 发生变化是我们要修复的。我们可以使用两个插件来解决这个问题。
第一个插件是 `NamedModulesPlugin`，将使用模块的路径，而不是数字标识符。虽然此插件有助于在开发过程中输出结果的可读性，然而执行时间会长一些。
第二个选择是使用 `HashedModuleIdsPlugin`，推荐用于生产环境构建。这里我们使用`HashedModuleIdsPlugin`, eg:

``` js
// ...
new webpack.HashedModuleIdsPlugin(),
new webpack.optimize.CommonsChunkPlugin({
  name: 'vendor',
  minChunks (module) {
    return (
      module.resource && /\.js$/.test(module.resource) && module.resource.indexOf(
        path.join(__dirname, '../node_modules')
      ) === 0
    )
  }
}),
new webpack.optimize.CommonsChunkPlugin({
  name: 'manifest',
  minChunks: Infinity
}),
new webpack.optimize.CommonsChunkPlugin({
  name: 'app',
  async: 'vendor-async',
  children: true,
  minChunks: 2
}),
// ...
```

现在，不管再添加任何新的本地依赖，对于每次构建，`vendor hash` 都保持一致。

`HashedModuleIdsPlugin`会根据模块的相对路径生成一个四位数的`hash`作为模块id(`module.id`), 用于生产环境。

未使用`HashedModuleIdsPlugin`时， `module.id`为数字标识：

``` js
webpackJsonp([6],{
/***/ 15:
/***/ (function(module, __webpack_exports__, __webpack_require__) {
// ...
},[15]);
```

使用`HashedModuleIdsPlugin`后: 以四位数的`hash`作为`module.id`：

``` js
webpackJsonp([6], {
  "3Di9":
    (function (module, __webpack_exports__, __webpack_require__) {
// ...
}, ["Bau1"]);
```

# options:

`hashFunction`: 散列算法，默认为 'md5'。支持 Node.JS `crypto.createHash` 的所有功能。

`hashDigest`: 在生成 hash 时使用的编码方式，默认为 'base64'。支持 Node.js `hash.digest` 的所有编码。

`hashDigestLength`: 散列摘要的前缀长度，默认为 4

eg:

``` js
new webpack.HashedModuleIdsPlugin({
  hashFunction: 'sha256',
  hashDigest: 'hex',
  hashDigestLength: 20
})
```


