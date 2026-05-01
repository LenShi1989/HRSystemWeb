<template>
  <div class="page">
    <div class="page-header">
      <h2 class="page-title">考勤管理</h2>
      <el-button type="primary" :icon="Plus" @click="openDialog()">新增考勤</el-button>
    </div>

    <div class="filter-bar">
      <el-select v-model="query.employeeId" clearable filterable placeholder="員工" style="width: 180px" @change="fetchData">
        <el-option v-for="employee in employees" :key="employee.id" :label="employee.fullName" :value="employee.id" />
      </el-select>
      <el-date-picker v-model="query.startDate" type="date" value-format="YYYY-MM-DD" placeholder="開始日期" style="width: 150px" @change="fetchData" />
      <el-date-picker v-model="query.endDate" type="date" value-format="YYYY-MM-DD" placeholder="結束日期" style="width: 150px" @change="fetchData" />
    </div>

    <div class="table-card">
      <el-table :data="attendances" v-loading="loading" style="width: 100%">
        <el-table-column prop="employeeName" label="員工" width="140" />
        <el-table-column prop="attendDate" label="日期" width="120" />
        <el-table-column prop="checkIn" label="上班時間" width="120">
          <template #default="{ row }">{{ formatTime(row.checkIn) }}</template>
        </el-table-column>
        <el-table-column prop="checkOut" label="下班時間" width="120">
          <template #default="{ row }">{{ formatTime(row.checkOut) }}</template>
        </el-table-column>
        <el-table-column prop="workHours" label="工時" width="90">
          <template #default="{ row }">{{ row.workHours ?? '-' }}</template>
        </el-table-column>
        <el-table-column label="狀態" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small">
              {{ row.statusLabel || statusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remarks" label="備註" min-width="180">
          <template #default="{ row }">{{ row.remarks || '-' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="110" fixed="right">
          <template #default="{ row }">
            <el-button text size="small" type="primary" @click="openDialog(row)">編輯</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="query.page"
        v-model:page-size="query.pageSize"
        :total="total"
        :page-sizes="[20, 50, 100]"
        layout="total, sizes, prev, pager, next"
        style="margin-top: 16px; justify-content: flex-end"
        @change="fetchData"
      />
    </div>

    <el-dialog v-model="dialogVisible" :title="editMode ? '編輯考勤' : '新增考勤'" width="560px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="員工" prop="employeeId">
          <el-select v-model="form.employeeId" filterable placeholder="選擇員工" style="width: 100%">
            <el-option v-for="employee in employees" :key="employee.id" :label="employee.fullName" :value="employee.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期" prop="attendDate">
          <el-date-picker v-model="form.attendDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="上班時間">
          <el-time-picker v-model="form.checkIn" value-format="HH:mm:ss" format="HH:mm" placeholder="選擇時間" style="width: 100%" />
        </el-form-item>
        <el-form-item label="下班時間">
          <el-time-picker v-model="form.checkOut" value-format="HH:mm:ss" format="HH:mm" placeholder="選擇時間" style="width: 100%" />
        </el-form-item>
        <el-form-item label="狀態" prop="status">
          <el-select v-model="form.status" style="width: 100%">
            <el-option v-for="option in attendanceStatuses" :key="option.value" :label="option.label" :value="option.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="備註">
          <el-input v-model="form.remarks" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">儲存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { attendanceApi, employeeApi } from '@/services/api'
import type { Attendance, Employee } from '@/services/api'

const loading = ref(false)
const submitting = ref(false)
const attendances = ref<Attendance[]>([])
const employees = ref<Employee[]>([])
const total = ref(0)
const dialogVisible = ref(false)
const editMode = ref(false)
const formRef = ref<FormInstance>()

const query = reactive({
  employeeId: undefined as number | undefined,
  startDate: '',
  endDate: '',
  page: 1,
  pageSize: 20,
})

const form = reactive({
  employeeId: undefined as number | undefined,
  attendDate: '',
  checkIn: '',
  checkOut: '',
  status: 1,
  remarks: '',
})

const attendanceStatuses = [
  { label: '正常', value: 1 },
  { label: '遲到', value: 2 },
  { label: '早退', value: 3 },
  { label: '缺勤', value: 4 },
  { label: '公假', value: 5 },
  { label: '事假', value: 6 },
  { label: '病假', value: 7 },
]

const rules: FormRules = {
  employeeId: [{ required: true, message: '請選擇員工', trigger: 'change' }],
  attendDate: [{ required: true, message: '請選擇日期', trigger: 'change' }],
  status: [{ required: true, message: '請選擇狀態', trigger: 'change' }],
}

function statusLabel(value: number) {
  return attendanceStatuses.find(item => item.value === value)?.label || '未知'
}

function statusType(value: number) {
  const types: Record<number, 'success' | 'warning' | 'danger' | 'info'> = {
    1: 'success',
    2: 'warning',
    3: 'warning',
    4: 'danger',
    5: 'info',
    6: 'info',
    7: 'info',
  }
  return types[value] || 'info'
}

function formatTime(value?: string) {
  return value ? value.slice(0, 5) : '-'
}

async function fetchData() {
  loading.value = true
  try {
    const res = await attendanceApi.getAll(query)
    attendances.value = res.data.items
    total.value = res.data.total
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '取得考勤資料失敗')
  } finally {
    loading.value = false
  }
}

function openDialog(attendance?: Attendance) {
  editMode.value = Boolean(attendance)
  Object.assign(form, {
    employeeId: attendance?.employeeId,
    attendDate: attendance?.attendDate || '',
    checkIn: attendance?.checkIn || '',
    checkOut: attendance?.checkOut || '',
    status: attendance?.status ?? 1,
    remarks: attendance?.remarks || '',
  })
  dialogVisible.value = true
}

async function handleSubmit() {
  await formRef.value?.validate()
  submitting.value = true
  try {
    await attendanceApi.upsert(form)
    ElMessage.success(editMode.value ? '考勤已更新' : '考勤已新增')
    dialogVisible.value = false
    fetchData()
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '儲存考勤失敗')
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  try {
    const res = await employeeApi.getAll({ pageSize: 200, status: 1 })
    employees.value = res.data.items
  } catch {
    employees.value = []
  }
  fetchData()
})
</script>

<style scoped>
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.page-title { color: #f1f5f9; font-size: 20px; font-weight: 600; margin: 0; }
.filter-bar { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; }
.table-card { background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 20px; }
:deep(.el-table) { background: transparent !important; color: #94a3b8; }
:deep(.el-table tr) { background: transparent !important; }
:deep(.el-table th.el-table__cell) { background: #0f172a !important; color: #64748b; border-bottom: 1px solid #334155; }
:deep(.el-table td.el-table__cell) { border-bottom-color: #334155; }
:deep(.el-table--enable-row-hover .el-table__body tr:hover > td) { background: rgba(59, 130, 246, 0.05) !important; }
:deep(.el-dialog) { background: #1e293b; border: 1px solid #334155; }
:deep(.el-dialog__title), :deep(.el-form-item__label) { color: #f1f5f9; }
:deep(.el-input__wrapper), :deep(.el-textarea__inner) { background: #0f172a; border-color: #334155; color: #f1f5f9; }
</style>
