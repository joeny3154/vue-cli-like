
配置eslint
=======
`npm i --save-dev eslint eslint-loader eslint-friendly-formatter`

1. 配置loader

``` js
rules: [
  {
    test: /\.(js|vue)$/,
    loader: 'eslint-loader',
    // 强制配置成 前置loader，以便能检查源文件，而不是被babel-loader修改后的文件
    enforce: 'pre',
    include: [resolve('src'), resolve('test')],
    options: {
      // 这里我们使用社区的一款eslint格式化程序
      formatter: require('eslint-friendly-formatter'),
      // 测试环境下，错误信息在浏览器console以警告(console.warn)的形式显示,不以console.error(显示)
      emitWarning: !config.dev.showEslintErrorsInOverlay // !false
    }
  },
  {
    test: /\.js$/,
    loader: 'babel-loader',
    include: [resolve('src'), resolve('test')]
  }
]
```

**独立出配置文件**：为了独立出开发和生产环境下的配置选项，我们在项目根目录添加`config/index.js`文件:

``` js
module.exports = {
  dev: {
    // 是否在浏览器console中显示eslint的error级别信息，
    // 这里我们希望都已经警告级别来显示，所以设置为false
    showEslintErrorsInOverlay: false
  },
  build: {
    
  }
}
```

# .eslintrc.js

ESLint 支持多种格式的配置文件：
这里我们选择使用JavaScript格式，在项目根目录新建一个`.eslintrc.js`模块，然后输出一个配置对象。

``` js
/* .eslintrc.js */
module.exports = {
  // ESLint可以层叠配置，把离检测的文件最近的 `.eslintrc`文件作为最高优先级，然后还会去父目录里的配置文件，这里设置"root": true，找到此文件后会停止在父级目录中寻找
  root: true,
  // ESLint 默认使用Espree作为其解析器, Babel-ESLint 是对Babel解析器的包装使其与 ESLint 兼容
  parser: 'babel-eslint',
  // 解析器配置选项
  parserOptions: {
    // sourceType：默认为 "script"，我们这里使用ECMAScript模块，设置为"module"
    sourceType: 'module'
  },
  // 启用browser环境
  env: {
    browser: true,
  },
  // 扩展的代码规范风格，这里我们使用eslint-config-standard
  // 具体代码规范风格可查看：https://github.com/standard/standard/blob/master/docs/RULES-zhcn.md
  extends: 'standard',
  plugins: [
    // 添加 eslint-plugin-html 插件以支持.vue 文件中JavaScript的校验, 
    // 配置可以忽略 eslint-plugin- 前缀
    'html'
  ],
  // 添加自定义的规则

  rules: {
    // "off" 或 0: 关闭规则; 
    // "warn" 或 1: 开启规则，警告级别(不会导致程序退出); 
    // "error" 或 2 - 开启规则，使用错误级别的错误：error (被触发时程序会退出)

    // 允许 async-await
    'generator-star-spacing': 'off',
    // 生产环境允许 debugger
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
  }
}
```

以上需要安装如下内容：

`npm i --save-dev babel-eslint eslint-plugin-html eslint-config-standard`

`npm i --save-dev eslint-config-standard`

因为`eslint-config-standard` 依赖 `eslint-plugin-import eslint-plugin-node eslint-plugin-promise eslint-plugin-standard` 三个插件

所以：`npm i --save-dev eslint-plugin-import eslint-plugin-node eslint-plugin-promise eslint-plugin-standard`