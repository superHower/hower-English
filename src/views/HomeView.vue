<template>
  <div class="about">
    <div class="top">
      <div class="content-left">
        <el-select size="small" style="width: 150px;" v-model="search.book" placeholder="Book" @change="handleBook">
          <el-option value="7A" label="7A"></el-option>
          <el-option value="7B" label="7B"></el-option>
          <el-option value="8A" label="8A"></el-option>
          <el-option value="8B" label="8B"></el-option>
          <el-option value="9A" label="9A"></el-option>
          <el-option value="9B" label="9B"></el-option>
        </el-select>
        <el-select size="small" v-model="search.type" multiple placeholder="Choose word type">
          <el-option value="v" :label="vcnt"></el-option>
          <el-option value="n" :label="ncnt"></el-option>
          <el-option value="a" :label="acnt"></el-option>
          <el-option value="o" :label="ocnt"></el-option>
          <el-option value="d" :label="dcnt"></el-option>
        </el-select>
        <el-button size="small" class="submit" @click="searchHandle(true)">背诵</el-button>
        <el-button size="small" type="primary" class="submit" @click="searchHandle(false)">默写</el-button>
      </div>
      <div class="top-down">
        <div class="time"><span>{{ Math.floor(remainingTime / 60) }} m {{ remainingTime % 60 }} s</span></div>
        <div class="score">score：<span>{{ score }}</span></div>
        <el-button size="small" class="submit" type="success" @click="handleSubmit">submit</el-button>
      </div>

    </div>
    <div class="content">
      <el-table :data="tableData" :style="{width: windowWidth + 'px'}">
        <el-table-column type="index" label="ID" width="50" />
        <el-table-column label="Input" width="125">
          <template #default="scope">
            <el-input type="input" placeholder="Please input" v-model="scope.row.input"
              @keyup.enter="focusNextInput(scope.$index)" @change="changeHandle"></el-input>
          </template>
        </el-table-column>
        <el-table-column prop="cn" label="Chinese" width="80" />
        <el-table-column prop="en" label="English" width="120">
          <template #default="scope">
            <div v-show="showAnswers" :class="scope.row.res ? 'ok' : 'err'">{{ scope.row.en }}</div>
          </template>
        </el-table-column>
        <el-table-column label="战绩" width="60">
          <template #default="scope">
            {{ scope.row.error }} / {{ scope.row.cnt }}
          </template>
        </el-table-column>
        <el-table-column prop="type" label="Type" width="80" />

        <el-table-column prop="unit" label="Unit" width="60" />
        <el-table-column prop="time" label="默写时间" width="180">
          <template #default="scope">
            {{ handleTime(scope.row.time) }}
          </template>
        </el-table-column>
      </el-table>
      <div :style="{width: windowWidth + 'px'}">
        <el-progress :text-inside="true" :stroke-width="15" striped-flow :percentage="progressPercentage" :color="color"/>
      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, nextTick,onBeforeUnmount, computed } from 'vue';
import db from './word.js'
const search = ref({
  book: "",
  type: "",
})

const wordData = ref([])
const tableData = ref([])
const database = ref([])
const vcnt = ref("")
const ncnt = ref("")
const dcnt = ref("")
const ocnt = ref("")
const acnt = ref("")
const score = ref(0);
const remainingTime = ref(0); // 假设每个单词有 10 秒时间
const showAnswers = ref(false); // 控制答案是否显示

const windowWidth = ref(window.innerWidth - 24);
onMounted(()=> {
  window.addEventListener('resize', handleResize);

  database.value = JSON.parse(localStorage.getItem('word'))
  if(!database.value) {
    localStorage.setItem('word', JSON.stringify(db))
    database.value = JSON.parse(localStorage.getItem('word'))
  }
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  clearInterval(countdownInterval);
});
const handleResize = () => {
  windowWidth.value = window.innerWidth - 24;
};
// 选择书本
const handleBook = () => {
  wordData.value = database.value.filter(item => item.book === search.value.book)
  let ve = 0, vc = 0, vt = 0, ae = 0, ac = 0, at = 0, de = 0, dc = 0, dt = 0, ne = 0, nc = 0, nt = 0, oe = 0, oc = 0, ot = 0
  wordData.value.forEach(item => {
    if (item.type == "n") {
      nt++
      if (item.error > 0) ne++;
      if (item.cnt > 0) nc++
    } else if (item.type == "v") {
      vt++
      if (item.error > 0) ve++;
      if (item.cnt > 0) vc++
    } else if (item.type == "a") {
      at++
      if (item.error > 0) ae++;
      if (item.cnt > 0) ac++
    } else if (item.type == "o") {
      ot++
      if (item.error > 0) oe++;
      if (item.cnt > 0) oc++
    } else if (item.type == "d") {
      dt++
      if (item.error > 0) de++;
      if (item.cnt > 0) dc++
    }
  })

  ncnt.value = "名词: " + nc + "/" + ne + "/" + nt
  acnt.value = "形容词: " + ac + "/" + ae + "/" + at
  dcnt.value = "短语: " + dc + "/" + de + "/" + dt
  vcnt.value = "动词: " + vc + "/" + ve + "/" + vt
  ocnt.value = "其他: " + oc + "/" + oe + "/" + ot
}
// 默写 or 背诵
function searchHandle(type) {
  showAnswers.value = type;
  tableData.value = []
  score.value = 0


  let newData = []
  let errData = []
  let okkData = []

  if (search.value.type.length == 2) {
    // 1. 拿到新单词
    newData = wordData.value.filter(item => item.cnt == 0 && (item.type == search.value.type[0] || item.type == search.value.type[1]))
    
    // 2. 拿到默写错的单词
    errData = wordData.value.filter(item => item.error > 0);
    // 排序：按照错误率、时间得分-->综合得分
    if (errData.length > 0) {
      const times = errData.map(item => item.time);// 获取时间范围用于标准化
      const maxTime = Math.max(...times);
      const minTime = Math.min(...times);
      const timeRange = maxTime - minTime || 1; // 避免除以0的情况
    
      errData.forEach(item => {
        const errorRate = item.cnt === 0 ? 1 : item.error / item.cnt;// 计算错误率（处理cnt为0的情况）
        const timeScore = (maxTime - item.time) / timeRange;// 计算时间得分（时间越早得分越高）
        item.score = errorRate * 0.7 + timeScore * 0.3;// 综合得分
      });
    
      // 按综合得分降序排序
      errData.sort((a, b) => b.score - a.score);
    } else {
      errData = [];
    }

    // 3. 拿到默写对的单词
    okkData = wordData.value.filter(item => item.cnt > 0 && item.error == 0);
    // 排序：按照默写对的单词的综合得分
    if (okkData.length > 0) {
      const times = okkData.map(item => item.time);      // 获取时间和次数的范围用于标准化
      const cnts = okkData.map(item => item.cnt);
      const maxTime = Math.max(...times);
      const minTime = Math.min(...times);
      const timeRange = maxTime - minTime || 1;
    
      const maxCnt = Math.max(...cnts);
      const minCnt = Math.min(...cnts);
      const cntRange = maxCnt - minCnt || 1;
    
      // 计算综合得分
      okkData.forEach(item => {
        // 时间得分：时间越早得分越高（更久未复习）
        const timeScore = (maxTime - item.time) / timeRange;
        
        // 次数得分：次数越少得分越高（需要巩固记忆）
        const cntScore = (maxCnt - item.cnt) / cntRange;
        
        // 综合得分（权重分配：时间60%，次数40%）
        item.score = timeScore * 0.6 + cntScore * 0.4;
      });
    
      // 按综合得分降序排序
      okkData.sort((a, b) => b.score - a.score);
    } else {
      okkData = [];
    }
    console.log("输出", newData, errData, okkData)
  } else {
    ElMessage.error('请选2种单词类型');
    return
  }
  // 学习10个新单词
  let newcnt = 0
  for (let item of newData) {
    if (newcnt == 10) break
    newcnt++
    tableData.value.push({...item, input: ""})
  }
  // 复习30个默写错的单词
  let errcnt = 0
  for (let item of errData) {
    // 此书快背完了，新单词不够, 错的单词来凑够40个
    if (errcnt == 40 - newcnt) break
    errcnt++
    tableData.value.push({...item, input: ""})
  }
  // 复习10个默写对的单词
  let okkcnt = 0
  for (let item of okkData) {
    // 几乎全默对了，没几个错的单词，对的单词来凑够50个
    if (okkcnt == 50 - newcnt - errcnt) break
    okkcnt++
    tableData.value.push({...item, input: ""})
  }
  // 此书刚开始背，没有默写错的或对的，新单词来凑够50个
  if (tableData.value.length < 50) {
    let ids = tableData.value.map(k => { return k.id })
    let remain = 50 - tableData.value.length
    for (let item of newData) {
      if (ids.includes(item.id)) continue
      if (remain == 0) break
      remain--
      tableData.value.push({...item, input: ""})
    }
  }
  // 要是还凑不满50个，那算了，可能总数据就不满50
  nextTick(() => {
    startCountdown(type);
  })
  

}
// 提交答案
function handleSubmit() {
  remainingTime.value = 0
}
function submitAnswers() {
  let errorList = []
  let correctCount = 0;
  let newWords = []
  let resData = []
  let resid = []

  tableData.value.forEach(item => {
    item.res = false
    item.cnt++
    item.time = Date.now()
    if (item.input && item.input.trim().toLowerCase() === item.en.toLowerCase()) {
      correctCount++;
      item.res = true
    } else {
      item.error++;
      errorList.push(item)
    }
    resData.push(item)
    resid.push(item.id)
    sessionStorage.setItem('errorlist', JSON.stringify(errorList))
  });
  
  
  score.value = ((correctCount / tableData.value.length) * 100).toFixed(1);
  showAnswers.value = true; // 提交后显示答案

  JSON.parse(localStorage.getItem('word')).forEach(k => {
    if (resid.includes(k.id)) newWords.push(resData.find(j => j.id == k.id))
    else newWords.push(k)
  })
  localStorage.setItem('word', JSON.stringify(newWords))
  // 记录日志
  let logData = {
    book: search.value.book,
    type: search.value.type,
    score: score.value,
    time: Date.now(),
    cnt: tableData.value.length,
    correct: correctCount,
    error: errorList.length,
  }
  // 拿到以前的日志
  let logList = localStorage.getItem('daylog') ? JSON.parse(localStorage.getItem('daylog')) : []
  // 添加新的日志
  logList.push(logData)
  // 存储到本地
  localStorage.setItem('daylog', JSON.stringify(logList))

  
}

// 计算已输入的数量
const completedCount = computed(() => {
  let count = 0;
  tableData.value.forEach(item => {
    if (item.input) {
      count++;
    }
  });
  return count;
});

// 计算完成度
const progressPercentage = computed(() => {
  return ((completedCount.value / tableData.value.length) * 100).toFixed(1);
});

// 计时
let countdownInterval;
function startCountdown(type) {
  clearInterval(countdownInterval); // 清理之前的定时器
  remainingTime.value = search.value.type == 'd' ? tableData.value.length * 20 : tableData.value.length * 10;
  if(!type) {
    countdownInterval = setInterval(() => {
      if (remainingTime.value > 0) {
        remainingTime.value--;
      } else {
        clearInterval(countdownInterval);
        submitAnswers(); // 时间到自动提交
        ElMessage.warning('时间到！');
      }
    }, 1000);
  }else {
    score.value = 0
    remainingTime.value = 0
  }
}


// 单词输入时，显示速度
let color = ref('#ffffff')
function changeHandle() {
  let time = tableData.value.length * 10 - remainingTime.value - completedCount.value * 10
  let RATE = search.value.type == 'd' ? 20 : 10
  if (time >= 1.5 * RATE) color.value = '#f56c6c'
  else if (time >= RATE && time < 1.5 * RATE) color.value = '#e6a23c'
  else if (time >= 0 && time < RATE) color.value = '#5cb87a'
  else if (time >= -RATE && time < 0) color.value = '#1989fa'
  else if (time <= -RATE) color.value = '#6f7ad3'
}
// 回车自动换行
function focusNextInput(index) {
  if (index < tableData.value.length - 1) {
    nextTick(() => {
      const inputs = document.querySelectorAll('.el-input__inner');
      if (index + 1 < inputs.length) {
        inputs[index + 1].focus();
      }
    });
  }
}
// 处理默写时间
function handleTime(t) {
  let diff = Date.now() - t
  let day = Math.floor(diff / (24 * 60 * 60 * 1000))
  let hour = Math.floor(diff / (60 * 60 * 1000))
  let min = Math.floor(diff / (60 * 1000))
  let sec = Math.floor(diff / (1000))
  if (day < 1) {
    if (hour < 1) {
      if (min < 1) {
        return "before " +  sec + " second"
      }
      else return "before " +  min + " mintute"
    }
    else return "before " +  hour + " hour"
  }
  else return "before " +  day + " day"
}

</script>


<style>
.about {
  height: 100%;
  width: 100%;
}

.top {
  display: flex;
  flex-flow: column wrap;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  color: #fff;
}


.title {
  font-size: 24px;
  font-weight: bold;
}


.score,
.time {
  font-size: 16px;
}


.score span,
.time span {
  font-weight: bold;
  font-size: 20px;
  color: orange;
}

.content {
  height: calc(100% - 106px);
  display: flex;
  flex-flow: column nowrap;
  justify-content: space-around;
  align-items: center;
}

.el-table {
  border: 1px solid #ddd;
  border-radius: 5px;
  overflow: hidden;
  background-color: #fff;
  height: 100%;

}


.el-table.el-table__header-wrapper th {
  background-color: #e0e0e0;
  font-weight: bold;
}


.el-table.el-table__row {
  cursor: pointer;
  transition: background-color 0.3s ease;
}


.el-table.el-table__row:hover {
  background-color: #f0f0f0;
}

.percentage-value {
  font-weight: bold;
  color: #fff;
  font-size: 20px;
}

.percentage-label {
  margin-left: 5px;
  color: #fff;
}


.submit {
  cursor: pointer;
  padding: 5px 10px;
  border: none;
  border-radius: 5px;
}

.ok {
  color: green;
}

.err {
  color: red;
}


.content-left {
  display: flex;
  width: 100%;
  justify-content: space-around;
  align-items: center;
}
.content-left>.el-select {
  margin-right: 12px;
}

.right-top {
  display: flex;
  justify-content: center;
  align-items: center;
}
.top-down {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}
</style>
