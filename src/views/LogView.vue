<template>
  <div class="log">
    <el-button type="primary" @click="exportToExcel">导出为 Excel</el-button>
    <el-table :data="logList" :style="{ width: windowWidth + 'px' }">
      <el-table-column prop="time" label="时间" width="180">
        <template #default="{ row }">
          {{ formatTime(row.time) }}
        </template>
      </el-table-column>
      <el-table-column prop="book" label="书籍" width="80"></el-table-column>
      <el-table-column prop="type" label="类型" width="80">
        <template #default="{ row }">
          {{ row.type.join(', ') }}
        </template>
      </el-table-column>
      <el-table-column prop="score" label="分数" width="80"></el-table-column>
      <el-table-column prop="cnt" label="总数" width="80"></el-table-column>
      <el-table-column prop="correct" label="正确数" width="80"></el-table-column>
      <el-table-column prop="error" label="错误数" width="80"></el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';

let logList = ref([]);
const windowWidth = ref(window.innerWidth - 24);

onMounted(() => {
  window.addEventListener('resize', handleResize);
  logList.value = JSON.parse(localStorage.getItem('daylog'));
  console.log(logList.value);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
});

const handleResize = () => {
  windowWidth.value = window.innerWidth - 24;
};

// 格式化时间的函数
const formatTime = (timestamp) => {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss');
};

// 导出为 Excel 的函数
const exportToExcel = () => {
  // 处理数据，确保时间字段已经格式化
  const formattedData = logList.value.map((row) => ({
    ...row,
    time: formatTime(row.time),
    type: row.type.join(', ')
  }));

  // 创建工作簿
  const ws = XLSX.utils.json_to_sheet(formattedData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

  // 导出文件
  XLSX.writeFile(wb, 'log_data.xlsx');
};
</script>

<style scoped>
.log {
  width: auto;
  height: calc(100% - 100px);
}
</style>