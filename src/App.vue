<template>
  <div id="app">
    <nav>
      <RouterLink to="/">背默列表</RouterLink>
      <RouterLink to="/about">错误列表</RouterLink>
      <RouterLink to="/log">日志记录</RouterLink>
    </nav>
    <div class="content">
      <RouterView />
    </div>

  </div>
</template>

<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>
<style scoped>
body {
  margin: 0;
  /* 去除body的默认边距 */
  height: 100vh;
  /* 使用视口高度作为body的高度 */
}

#app {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: #f0f0f0;
  font-family: Arial, sans-serif;
}

nav {
  display: flex;
  justify-content: center;
  gap: 20px;
  background-color: #333;
  padding: 10px;
  width: 100%;
}

nav a {
  color: white;
  text-decoration: none;
  font-weight: bold;
  transition: color 0.3s ease;
}

nav a:hover {
  color: #ddd;
}

.content {
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100% - 38px);
  background-color: #161823;
}
</style>