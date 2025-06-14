<!-- src/views/Error404.vue -->
<template>
    <div class="error-page">
      <h1>404 - 页面不存在</h1>
      <p>你访问的页面不存在，请返回首页。</p>
      <router-link to="/">返回首页</router-link>
    </div>
  </template>
  
  <style scoped>
  .error-page {
    text-align: center;
    padding: 50px;
  }
  </style>