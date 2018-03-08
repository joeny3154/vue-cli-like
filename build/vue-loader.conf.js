'use strict'
const utils = require('./utils')
const config = require('../config')
const isProduction = process.env.NODE_ENV === 'production'
const sourceMapEnabled = isProduction ? config.build.productionSourceMap : config.dev.cssSourceMap

module.exports = {
  loaders: utils.cssLoaders({
    sourceMap: sourceMapEnabled,
    extract: isProduction
  }),
  // 是否开启 CSS 的 source maps，关闭可以避免 css-loader 的 some relative path related bugs 同时可以加快构建速度。
  // 注意，这个值会在 webpack 配置中没有 devtool 的情况下自动设置为 false。
  cssSourceMap: sourceMapEnabled,
  // cacheBusting: config.dev.cacheBusting,
  // 在模版编译过程中，编译器可以将某些属性，如 src 路径，转换为 require 调用，以便目标资源可以由 webpack 处理。
  // 默认配置会转换 <img> 标签上的 src 属性和 SVG 的 <image> 标签上的 xlink：href 属性。
  // 默认值: { img: 'src', image: 'xlink:href' }
  transformToRequire: {
    video: ['src', 'poster'],
    source: 'src',
    img: 'src',
    image: 'xlink:href'
  }
}
