<template>
  <div class="about">
    <el-table :data="errorList" :style="{width: windowWidth + 'px'}">
        <el-table-column prop="cn" label="中文" width="200" />
      <el-table-column prop="en" label="英文" />
    </el-table>
  </div>
</template>
<script setup lang="js">
import { ref, onMounted, onBeforeUnmount } from 'vue';

let errorList = ref([])
const windowWidth = ref(window.innerWidth - 24);
onMounted(() => {
  window.addEventListener('resize', handleResize);

  errorList.value = JSON.parse(sessionStorage.getItem('errorlist'))
  console.log(errorList.value)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
});
const handleResize = () => {
  windowWidth.value = window.innerWidth - 24;
};
</script>

<style>
.about {
  width: auto;
}
</style>
