<template>
  <div class="page">
    <div class="page-header">
      <h2 class="page-title">薪資管理</h2>
      <el-button type="primary" :icon="Plus" @click="openDialog">新增薪資單</el-button>
    </div>

    <div class="filter-bar">
      <el-date-picker v-model="filterMonth" type="month" value-format="YYYY-MM"
        placeholder="選擇月份" style="width: 160px" @change="fetchData" />
    </div>

    <div class="table-card">
      <el-table :data="payrolls" v-loading="loading" style="width: 100%">
        <el-table-column prop="employeeName" label="員工" width="100" />
        <el-table-column label="薪資期間" width="110">
          <template #default="{ row }">{{ row.payYear }}/{{ String(row.payMonth).padStart(2,'0') }}</template>
        </el-table-column>
        <el-table-column prop="baseSalary" label="底薪" width="110">
          <template #default="{ row }">{{ fmt(row.baseSalary) }}</template>
        </el-table-column>
        <el-table-column prop="bonus" label="獎金" width="100">
          <template #default="{ row }">{{ fmt(row.bonus) }}</template>
        </el-table-column>
        <el-table-column prop="allowance" label="津貼" width="100">
          <template #default="{ row }">{{ fmt(row.allowance) }}</template>
        </el-table-column>
        <el-table-column prop="overtime" label="加班費" width="100">
          <template #default="{ row }">{{ fmt(row.overtime) }}</template>
        </el-table-column>
        <el-table-column prop="insurance" label="保險費" width="100">
          <template #default="{ row }">
            <span style="color: #f87171">-{{ fmt(row.insurance) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="tax" label="所得稅" width="100">
          <template #default="{ row }">
            <span style="color: #f87171">-{{ fmt(row.tax) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="netSalary" label="實發薪資" width="120">
          <template #default="{ row }">
            <strong style="color: #34d399">{{ fmt(row.netSalary) }}</strong>
          </template>
        </el-table-column>
        <el-table-column label="狀態" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'warning'" size="small">
              {{ row.status === 1 ? '已發放' : '草稿' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status === 0" text size="small" type="success"
              @click="markPaid(row)">發放</el-button>
            <span v-else style="color: #64748b; font-size: 12px">{{ row.paidAt?.slice(0,10) }}</span>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination v-model:current-page="page" :total="total" :page-size="20"
        layout="total, prev, pager, next" style="margin-top: 16px; justify-content: flex-end"
        @current-change="fetchData" />
    </div>

    <!-- Create Dialog -->
    <el-dialog v-model="dialogVisible" title="新增薪資單" width="560px">
      <el-form :model="form" ref="formRef" label-width="100px">
        <el-row :gutter="12">
          <el-col :span="24">
            <el-form-item label="員工" prop="employeeId" :rules="[{required:true}]">
              <el-select v-model="form.employeeId" filterable style="width:100%">
                <el-option v-for="e in employees" :key="e.id" :label="e.fullName" :value="e.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="年份" prop="payYear" :rules="[{required:true}]">
              <el-input-number v-model="form.payYear" :min="2000" :max="2100" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="月份" prop="payMonth" :rules="[{required:true}]">
              <el-select v-model="form.payMonth" style="width:100%">
                <el-option v-for="m in 12" :key="m" :label="`${m} 月`" :value="m" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="底薪"><el-input-number v-model="form.baseSalary" :min="0" style="width:100%" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="獎金"><el-input-number v-model="form.bonus" :min="0" style="width:100%" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="津貼"><el-input-number v-model="form.allowance" :min="0" style="width:100%" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="加班費"><el-input-number v-model="form.overtime" :min="0" style="width:100%" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="保險費"><el-input-number v-model="form.insurance" :min="0" style="width:100%" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所得稅"><el-input-number v-model="form.tax" :min="0" style="width:100%" /></el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="實發薪資">
              <strong style="color: #34d399; font-size:16px">{{ fmt(netSalary) }}</strong>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="備註"><el-input v-model="form.remarks" type="textarea" :rows="2" /></el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">儲存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { payrollApi, employeeApi } from '@/services/api'
import type { Payroll, Employee } from '@/services/api'

const now = new Date()
const loading   = ref(false)
const submitting = ref(false)
const payrolls  = ref<Payroll[]>([])
const employees = ref<Employee[]>([])
const total     = ref(0)
const page      = ref(1)
const filterMonth = ref(`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`)
const dialogVisible = ref(false)
const formRef   = ref()

const form = reactive({
  employeeId: undefined as number | undefined,
  payYear: now.getFullYear(), payMonth: now.getMonth()+1,
  baseSalary: 0, bonus: 0, allowance: 0, overtime: 0,
  deduction: 0, insurance: 0, tax: 0, remarks: ''
})

const netSalary = computed(() =>
  form.baseSalary + form.bonus + form.allowance + form.overtime
  - form.deduction - form.insurance - form.tax
)

const fmt = (v: number) => `NT$ ${v.toLocaleString()}`

async function fetchData() {
  loading.value = true
  try {
    let year: number | undefined, month: number | undefined
    if (filterMonth.value) {
      const [y, m] = filterMonth.value.split('-').map(Number)
      year = y; month = m
    }
    const res = await payrollApi.getAll({ year, month, page: page.value, pageSize: 20 })
    payrolls.value = res.data.items
    total.value    = res.data.total
  } finally {
    loading.value = false
  }
}

function openDialog() {
  Object.assign(form, { employeeId: undefined, payYear: now.getFullYear(),
    payMonth: now.getMonth()+1, baseSalary: 0, bonus: 0, allowance: 0,
    overtime: 0, deduction: 0, insurance: 0, tax: 0, remarks: '' })
  dialogVisible.value = true
}

async function handleSubmit() {
  await formRef.value.validate()
  submitting.value = true
  try {
    await payrollApi.create({ ...form, deduction: form.deduction })
    ElMessage.success('新增成功')
    dialogVisible.value = false
    fetchData()
  } catch (e: any) {
    ElMessage.error(e.response?.data?.message || '新增失敗')
  } finally {
    submitting.value = false
  }
}

async function markPaid(row: Payroll) {
  await ElMessageBox.confirm(`確定發放 ${row.employeeName} 的薪資？`, '確認', { type: 'warning' })
  await payrollApi.markPaid(row.id)
  ElMessage.success('薪資已發放')
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
