webpack3新特性————作用域提升(scope hoisting)
======

过去 webpack 打包时的一个取舍是将 bundle 中各个模块单独打包成闭包。这些打包函数使你的 JavaScript 在浏览器中处理的更慢。相比之下，一些工具像 `Closure Compiler` 和 `RollupJS` 可以提升(hoist)或者预编译所有模块到一个闭包中，提升你的代码在浏览器中的执行速度。

这个插件会在 webpack 中实现以上的预编译功能, eg:`new webpack.optimize.ModuleConcatenationPlugin()`。这种连结行为被称为“作用域提升(`scope hoisting`)”。

> 由于实现 ECMAScript 模块语法，作用域提升(scope hoisting)这个特定于此语法的功能才成为可能。webpack 可能会根据你正在使用的**模块类型**和[部分其他的情况](https://doc.webpack-china.org/plugins/module-concatenation-plugin/)，回退到**普通打包方式**。

webpack2 普通打包：

``` js
// 未变量提升
webpackJsonp([6], {
  "3Di9":
    (function (module, __webpack_exports__, __webpack_require__) {
      "use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = print;
      function print(text) {
        console.log('print=>', text);
      }

    }),
  "Bau1":
    (function (module, __webpack_exports__, __webpack_require__) {
      "use strict";
      Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__print__ = __webpack_require__("3Di9");
      Object(__WEBPACK_IMPORTED_MODULE_0__print__["a" /* default */])('test');

    })
}, ["Bau1"]);
```

webapck3 启用`ModuleConcatenationPlugin`, 启用作用域提升(`scope hoisting`)
``` js

webpackJsonp([6], {
  "Bau1":
    (function (module, __webpack_exports__, __webpack_require__) {
      "use strict";
      Object.defineProperty(__webpack_exports__, "__esModule", { value: true });

      // CONCATENATED MODULE: ./src/print.js
      function print(text) {
        console.log('print=>', text);
      }
      // CONCATENATED MODULE: ./src/lib.js
      print('test');

    })
}, ["Bau1"]);
```

*tip*: `module.id` 由数字变为四位数的`hash`，这是由`HashedModuleIdsPlugin`实现的，用于稳定`module.id`

显而易见，这次 Webpack 将所有模块都放在了一个函数里，直观感受就是——函数声明少了很多，因此而带来的好处有：

1. 文件体积比之前更小。
2. 运行代码时创建的函数作用域也比之前少了，开销也随之变小。
项目中的模块越多，上述的两点提升就会越明显

这个功能的原理很简单：将所有模块的代码按照引用顺序放在一个函数作用域里，然后适当的重命名一些变量以防止变量名冲突

# 注意

1. 此插件仅适用于由 webpack 直接处理的 ES6 模块。

在使用转译器(`transpiler`)时，你需要禁用对模块的处理（例如 `Babel` 中的 `modules` 选项）。

暂不支持 CommonJS 模块语法的原因是，这种模块语法中的模块是可以动态加载的，例如下面这段代码
``` js
var directory = './modules/'
if (Math.random() > 0.5) {
  module.exports = require(directory + 'foo.js')
} else {
  module.exports = require(directory + 'bar.js')
}
```
这种情况很难分析出模块之间的依赖关系及输出的变量。

而 ES2015 的模块语法规定 `import` 和 `export` 关键字必须在顶层、模块路径只能用字符串字面量，这种“强制静态化”的做法使代码在编译时就能确定模块的依赖关系，以及输入和输出的变量，所以这种功能实现起来会更加简便。

2. 其他情况导致webpack回退到了默认的打包方式

使用 `Scope Hoisting`，你的代码必须是用 ES2015 的模块语法写的，但是大部分 NPM 中的模块仍然是 `CommonJS` 语法（例如 `lodash`），所以导致 Webpack 回退到了默认的打包方式。

其他可能的原因还有比如 1. 使用了 `ProvidePlugin`、2. 使用了 `eval()` 函数、你的项目有多个 `entry`

了解更多查看[这里](https://doc.webpack-china.org/plugins/module-concatenation-plugin/)

运行 Webpack 时加上 `--display-optimization-bailout` 参数可以得知为什么你的项目无法使用 `Scope Hoisting`：`webpack --display-optimization-bailout`

3. 另外，当你使用这个插件的时候，模块热替换将不起作用，所以最好只在代码优化的时候才使用这个插件


https://www.cnblogs.com/wmhuang/p/7065396.html

https://doc.webpack-china.org/plugins/module-concatenation-plugin/