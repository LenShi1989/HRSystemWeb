<template>
  <div class="page">
    <div class="page-header">
      <h2 class="page-title">請假管理</h2>
      <el-button type="primary" :icon="Plus" @click="openDialog">申請請假</el-button>
    </div>

    <!-- Filters -->
    <div class="filter-bar">
      <el-select v-model="filterStatus" placeholder="審核狀態" clearable style="width: 140px" @change="fetchData">
        <el-option label="待審核" :value="0" />
        <el-option label="已核准" :value="1" />
        <el-option label="已拒絕" :value="2" />
        <el-option label="已撤銷" :value="3" />
      </el-select>
    </div>

    <div class="table-card">
      <el-table :data="leaves" v-loading="loading" style="width: 100%">
        <el-table-column prop="employeeName" label="員工" width="100" />
        <el-table-column prop="leaveTypeLabel" label="假別" width="90" />
        <el-table-column prop="startDate" label="開始日期" width="120" />
        <el-table-column prop="endDate" label="結束日期" width="120" />
        <el-table-column prop="days" label="天數" width="70" />
        <el-table-column prop="reason" label="原因" min-width="160" />
        <el-table-column label="狀態" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small">{{ row.statusLabel }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="approverName" label="審核人" width="100" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <template v-if="row.status === 0">
              <el-button text size="small" type="success" @click="approve(row, 1)">核准</el-button>
              <el-button text size="small" type="danger" @click="approve(row, 2)">拒絕</el-button>
            </template>
            <el-tag v-else type="info" size="small">已處理</el-tag>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="page"
        :total="total"
        :page-size="20"
        layout="total, prev, pager, next"
        style="margin-top: 16px; justify-content: flex-end"
        @current-change="fetchData"
      />
    </div>

    <!-- Apply Dialog -->
    <el-dialog v-model="dialogVisible" title="申請請假" width="500px">
      <el-form :model="form" ref="formRef" label-width="100px">
        <el-form-item label="員工" prop="employeeId" :rules="[{ required: true }]">
          <el-select v-model="form.employeeId" filterable placeholder="選擇員工" style="width: 100%">
            <el-option v-for="e in employees" :key="e.id" :label="e.fullName" :value="e.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="假別" prop="leaveType" :rules="[{ required: true }]">
          <el-select v-model="form.leaveType" style="width: 100%">
            <el-option v-for="t in leaveTypes" :key="t.value" :label="t.label" :value="t.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="開始日期" prop="startDate" :rules="[{ required: true }]">
          <el-date-picker v-model="form.startDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="結束日期" prop="endDate" :rules="[{ required: true }]">
          <el-date-picker v-model="form.endDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="天數" prop="days" :rules="[{ required: true }]">
          <el-input-number v-model="form.days" :min="0.5" :step="0.5" style="width: 100%" />
        </el-form-item>
        <el-form-item label="原因">
          <el-input v-model="form.reason" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">送出</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { leaveApi, employeeApi } from '@/services/api'
import type { LeaveRequest, Employee } from '@/services/api'

const loading    = ref(false)
const submitting = ref(false)
const leaves     = ref<LeaveRequest[]>([])
const employees  = ref<Employee[]>([])
const total      = ref(0)
const page       = ref(1)
const filterStatus = ref<number>()
const dialogVisible = ref(false)
const formRef    = ref()

const form = reactive({
  employeeId: undefined as number | undefined,
  leaveType: 1, startDate: '', endDate: '', days: 1, reason: ''
})

const leaveTypes = [
  { label: '年假', value: 1 }, { label: '事假', value: 2 },
  { label: '病假', value: 3 }, { label: '婚假', value: 4 },
  { label: '喪假', value: 5 }, { label: '產假', value: 6 },
  { label: '陪產假', value: 7 },
]

function statusType(s: number) {
  return s === 1 ? 'success' : s === 2 ? 'danger' : s === 3 ? 'info' : 'warning'
}

async function fetchData() {
  loading.value = true
  try {
    const res = await leaveApi.getAll({
      status: filterStatus.value, page: page.value, pageSize: 20
    })
    leaves.value = res.data.items
    total.value  = res.data.total
  } finally {
    loading.value = false
  }
}

function openDialog() {
  Object.assign(form, { employeeId: undefined, leaveType: 1, startDate: '', endDate: '', days: 1, reason: '' })
  dialogVisible.value = true
}

async function handleSubmit() {
  await formRef.value.validate()
  submitting.value = true
  try {
    await leaveApi.create(form)
    ElMessage.success('申請已送出')
    dialogVisible.value = false
    fetchData()
  } catch (e: any) {
    ElMessage.error(e.response?.data?.message || '送出失敗')
  } finally {
    submitting.value = false
  }
}

async function approve(row: LeaveRequest, status: number) {
  const label = status === 1 ? '核准' : '拒絕'
  await ElMessageBox.confirm(`確定${label}此假單？`, '確認', { type: 'warning' })
  await leaveApi.approve(row.id, { status, approverId: 1, approveNote: '' })
  ElMessage.success(`已${label}`)
  fetchData()
}

onMounted(async () => {
  const res = await employeeApi.getAll({ pageSize: 200, status: 1 })
  employees.value = res.data.items
  fetchData()
})
</script>

<style scoped>
.page { }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.page-title { color: #f1f5f9; font-size: 20px; font-weight: 600; margin: 0; }
.filter-bar { display: flex; gap: 12px; margin-bottom: 16px; }
.table-card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 20px; }
:deep(.el-table) { background: transparent !important; color: #94a3b8; }
:deep(.el-table tr) { background: transparent !important; }
:deep(.el-table th.el-table__cell) { background: #0f172a !important; color: #64748b; border-bottom: 1px solid #334155; }
:deep(.el-table td.el-table__cell) { border-bottom-color: #334155; }
:deep(.el-table--enable-row-hover .el-table__body tr:hover > td) { background: rgba(59,130,246,0.05) !important; }
:deep(.el-dialog) { background: #1e293b; border: 1px solid #334155; }
:deep(.el-dialog__title) { color: #f1f5f9; }
:deep(.el-form-item__label) { color: #94a3b8; }
:deep(.el-input__wrapper) { background: #0f172a; border-color: #334155; }
:deep(.el-input__inner) { color: #f1f5f9; }
</style>
