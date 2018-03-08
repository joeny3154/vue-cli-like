<template>
  <div id="app">
    <p>{{msg}}</p>
    <p class="less">less</p>
    <!-- <p class="less">less</p> -->
    <!-- <img :src="img" alt=""> -->
    <hr>
    <!-- <img :src="img1" alt=""> -->
    <hr>
    <!-- <img src="/static/img/banner.png" alt=""> -->
    <!-- <img src="/static/img/shai_tu_v1.png" alt=""> -->
    <!-- <img src="/static/img/banner-01.png" alt=""> -->
    <hr>
    <test-component />
    <test1-component />
    <test2-component />
  </div>
</template>

<script>
import './assets/styles/mixin.css'
import './lib/index.js'

// let img = require('./assets/img/banner.png')
// let img1 = require('/src/assets/img/bg-1.png')

export default {
  name: 'app',
  data () {
    return {
      msg: 'Hello world'
      // img,
      // img1
    }
  },
  components: {
    'test-component': () => import('./components/test'),
    'test1-component': () => import('./components/test1'),
    'test2-component': () => import('./components/test2')
  }
}
</script>

<style lang="css">
/* app.vue.css */
.clearfix::after {
  content: "clear";
  display: block;
  clear: both;
  line-height: 0;
  height: 0;
  visibility: hidden;
  zoom: 1;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  box-sizing: border-box;
}
</style>


