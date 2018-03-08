<template>
  <div class="test-w">test component</div>
</template>

<script>
import a from '../common/a.js'
export default {
  name: 'test',
  data () {
    return {}
  },
  created () {
    a()
  }
}
</script>

<style>

</style>
 