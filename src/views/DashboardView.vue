<template>
  <div class="dashboard">
    <h2 class="page-title">儀表板</h2>

    <!-- Stats Cards -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6" v-for="stat in stats" :key="stat.label">
        <div class="stat-card" :style="{ borderTopColor: stat.color }">
          <div class="stat-icon" :style="{ background: stat.color + '20', color: stat.color }">
            <el-icon size="24"><component :is="stat.icon" /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- Charts Row -->
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="14">
        <div class="chart-card">
          <h3>各部門在職人數</h3>
          <v-chart :option="barOption" style="height: 300px" autoresize />
        </div>
      </el-col>
      <el-col :span="10">
        <div class="chart-card">
          <h3>員工狀態分佈</h3>
          <v-chart :option="pieOption" style="height: 300px" autoresize />
        </div>
      </el-col>
    </el-row>

    <!-- Recent Activities -->
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="24">
        <div class="chart-card">
          <h3>近期請假申請</h3>
          <el-table :data="recentLeaves" size="small" style="background: transparent">
            <el-table-column prop="employeeName" label="員工" width="120" />
            <el-table-column prop="leaveTypeLabel" label="假別" width="100" />
            <el-table-column prop="startDate" label="開始日期" width="120" />
            <el-table-column prop="endDate" label="結束日期" width="120" />
            <el-table-column prop="days" label="天數" width="80" />
            <el-table-column prop="statusLabel" label="狀態">
              <template #default="{ row }">
                <el-tag
                  :type="row.status === 1 ? 'success' : row.status === 2 ? 'danger' : row.status === 3 ? 'info' : 'warning'"
                  size="small"
                >{{ row.statusLabel }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { use } from 'echarts/core'
import { BarChart, PieChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'
import { employeeApi, leaveApi } from '@/services/api'
import type { LeaveRequest } from '@/services/api'
import { User, OfficeBuilding, Calendar, Tickets } from '@element-plus/icons-vue'

use([BarChart, PieChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer])

const deptData    = ref<{ name: string; count: number }[]>([])
const totalEmp    = ref(0)
const activeEmp   = ref(0)
const newThisMonth = ref(0)
const recentLeaves = ref<LeaveRequest[]>([])

const stats = computed(() => [
  { label: '員工總數',   value: totalEmp.value,    icon: 'User',           color: '#60a5fa' },
  { label: '在職員工',   value: activeEmp.value,   icon: 'UserFilled',     color: '#34d399' },
  { label: '本月新進',   value: newThisMonth.value, icon: 'UserFilled',    color: '#fbbf24' },
  { label: '待審假單',   value: recentLeaves.value.filter(l => l.status === 0).length,
    icon: 'Tickets', color: '#f87171' },
])

const barOption = computed(() => ({
  backgroundColor: 'transparent',
  tooltip: { trigger: 'axis' },
  xAxis: {
    type: 'category',
    data: deptData.value.map(d => d.name),
    axisLabel: { color: '#94a3b8', fontSize: 11 },
    axisLine: { lineStyle: { color: '#334155' } },
  },
  yAxis: {
    type: 'value',
    axisLabel: { color: '#94a3b8' },
    splitLine: { lineStyle: { color: '#334155' } },
  },
  series: [{
    data: deptData.value.map(d => d.count),
    type: 'bar',
    barMaxWidth: 40,
    itemStyle: { color: '#3b82f6', borderRadius: [4, 4, 0, 0] },
  }],
}))

const pieOption = computed(() => ({
  backgroundColor: 'transparent',
  tooltip: { trigger: 'item' },
  legend: { orient: 'vertical', right: 10, textStyle: { color: '#94a3b8' } },
  series: [{
    type: 'pie',
    radius: ['40%', '70%'],
    data: [
      { value: activeEmp.value, name: '在職', itemStyle: { color: '#34d399' } },
      { value: totalEmp.value - activeEmp.value, name: '離職/其他', itemStyle: { color: '#f87171' } },
    ],
    label: { color: '#94a3b8' },
  }],
}))

onMounted(async () => {
  try {
    const [statsRes, leavesRes] = await Promise.all([
      employeeApi.getStats(),
      leaveApi.getAll({ pageSize: 10 }),
    ])
    totalEmp.value    = statsRes.data.total
    activeEmp.value   = statsRes.data.active
    newThisMonth.value = statsRes.data.newThisMonth
    deptData.value    = statsRes.data.byDepartment
    recentLeaves.value = leavesRes.data.items
  } catch (e) {
    // API not connected yet — show placeholder data
    totalEmp.value = 128; activeEmp.value = 115; newThisMonth.value = 5
    deptData.value = [
      { name: '資訊技術部', count: 32 },
      { name: '業務部', count: 28 },
      { name: '人力資源部', count: 15 },
      { name: '財務部', count: 12 },
      { name: '行政部', count: 10 },
    ]
  }
})
</script>

<style scoped>
.dashboard { }
.page-title { color: #f1f5f9; font-size: 20px; font-weight: 600; margin-bottom: 20px; }

.stat-card {
  background: #1e293b;
  border: 1px solid #334155;
  border-top: 3px solid;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}
.stat-icon {
  width: 48px; height: 48px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.stat-value { color: #f1f5f9; font-size: 28px; font-weight: 700; }
.stat-label { color: #64748b; font-size: 13px; margin-top: 2px; }

.chart-card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 20px;
}
.chart-card h3 { color: #94a3b8; font-size: 14px; font-weight: 500; margin-bottom: 16px; }

:deep(.el-table) { background: transparent !important; color: #94a3b8; }
:deep(.el-table tr) { background: transparent !important; }
:deep(.el-table th) { background: #0f172a !important; color: #64748b; }
:deep(.el-table td) { border-bottom-color: #334155; }
:deep(.el-table--enable-row-hover .el-table__body tr:hover > td) {
  background: rgba(59,130,246,0.05) !important;
}
</style>
