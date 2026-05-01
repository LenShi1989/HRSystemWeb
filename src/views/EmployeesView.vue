<template>
  <div class="page">
    <div class="page-header">
      <h2 class="page-title">員工管理</h2>
      <el-button type="primary" :icon="Plus" @click="openDialog()">新增員工</el-button>
    </div>

    <div class="filter-bar">
      <el-input v-model="query.keyword" placeholder="搜尋姓名 / 員工編號 / Email" clearable :prefix-icon="Search" style="width: 260px" @change="fetchData" />
      <el-select v-model="query.departmentId" placeholder="部門" clearable style="width: 160px" @change="fetchData">
        <el-option v-for="d in departments" :key="d.id" :label="d.name" :value="d.id" />
      </el-select>
      <el-select v-model="query.positionId" placeholder="職位" clearable style="width: 160px" @change="fetchData">
        <el-option v-for="p in positions" :key="p.id" :label="p.title" :value="p.id" />
      </el-select>
      <el-select v-model="query.status" placeholder="狀態" clearable style="width: 130px" @change="fetchData">
        <el-option label="在職" :value="1" />
        <el-option label="留職停薪" :value="2" />
        <el-option label="離職" :value="3" />
      </el-select>
    </div>

    <div class="table-card">
      <el-table :data="employees" v-loading="loading" style="width: 100%" row-class-name="table-row">
        <el-table-column prop="employeeNo" label="員工編號" width="110" />
        <el-table-column prop="fullName" label="姓名" width="110" />
        <el-table-column prop="departmentName" label="部門" width="130" />
        <el-table-column prop="positionTitle" label="職位" width="130" />
        <el-table-column prop="email" label="Email" min-width="180" />
        <el-table-column prop="phone" label="電話" width="130">
          <template #default="{ row }">{{ row.phone || '-' }}</template>
        </el-table-column>
        <el-table-column prop="hireDate" label="到職日" width="110" />
        <el-table-column prop="baseSalary" label="基本薪資" width="120">
          <template #default="{ row }">{{ formatCurrency(row.baseSalary) }}</template>
        </el-table-column>
        <el-table-column label="狀態" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small">{{ row.statusLabel }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button text size="small" @click="viewDetail(row.id)">詳情</el-button>
            <el-button text size="small" type="primary" @click="openDialog(row)">編輯</el-button>
            <el-button text size="small" type="danger" @click="handleDelete(row)">離職</el-button>
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

    <el-dialog v-model="dialogVisible" :title="editMode ? '編輯員工' : '新增員工'" width="760px" destroy-on-close>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="員工編號" prop="employeeNo">
              <el-input v-model="form.employeeNo" :disabled="editMode" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="身分證號">
              <el-input v-model="form.idCardNo" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="姓氏" prop="lastName">
              <el-input v-model="form.lastName" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="名字" prop="firstName">
              <el-input v-model="form.firstName" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性別">
              <el-select v-model="form.gender" style="width: 100%">
                <el-option label="未設定" :value="0" />
                <el-option label="男" :value="1" />
                <el-option label="女" :value="2" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="生日">
              <el-date-picker v-model="form.birthDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Email" prop="email">
              <el-input v-model="form.email" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="電話">
              <el-input v-model="form.phone" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="部門" prop="departmentId">
              <el-select v-model="form.departmentId" style="width: 100%">
                <el-option v-for="d in departments" :key="d.id" :label="d.name" :value="d.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="職位" prop="positionId">
              <el-select v-model="form.positionId" style="width: 100%">
                <el-option v-for="p in positions" :key="p.id" :label="p.title" :value="p.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="主管">
              <el-select v-model="form.managerId" clearable filterable style="width: 100%">
                <el-option v-for="e in employees" :key="e.id" :label="e.fullName" :value="e.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="到職日" prop="hireDate">
              <el-date-picker v-model="form.hireDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="雇用類型">
              <el-select v-model="form.employmentType" style="width: 100%">
                <el-option label="正職" :value="1" />
                <el-option label="約聘" :value="2" />
                <el-option label="兼職" :value="3" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="基本薪資" prop="baseSalary">
              <el-input-number v-model="form.baseSalary" :min="0" :step="1000" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="銀行帳號">
              <el-input v-model="form.bankAccount" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="editMode">
            <el-form-item label="狀態">
              <el-select v-model="form.status" style="width: 100%">
                <el-option label="在職" :value="1" />
                <el-option label="留職停薪" :value="2" />
                <el-option label="離職" :value="3" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="editMode">
            <el-form-item label="離職日">
              <el-date-picker v-model="form.resignDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="地址">
              <el-input v-model="form.address" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="緊急聯絡人">
              <el-input v-model="form.emergencyName" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="緊急電話">
              <el-input v-model="form.emergencyPhone" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="備註">
              <el-input v-model="form.remarks" type="textarea" :rows="2" />
            </el-form-item>
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
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import { departmentApi, employeeApi, positionApi } from '@/services/api'
import type { Department, Employee, Position } from '@/services/api'

const router = useRouter()
const loading = ref(false)
const submitting = ref(false)
const employees = ref<Employee[]>([])
const departments = ref<Department[]>([])
const positions = ref<Position[]>([])
const total = ref(0)
const dialogVisible = ref(false)
const editMode = ref(false)
const editId = ref<number>()
const formRef = ref()

const query = reactive({
  keyword: '',
  departmentId: undefined as number | undefined,
  positionId: undefined as number | undefined,
  status: undefined as number | undefined,
  page: 1,
  pageSize: 20,
})

const form = reactive({
  employeeNo: '',
  firstName: '',
  lastName: '',
  gender: 0,
  birthDate: '',
  idCardNo: '',
  email: '',
  phone: '',
  address: '',
  departmentId: undefined as number | undefined,
  positionId: undefined as number | undefined,
  managerId: undefined as number | undefined,
  hireDate: '',
  resignDate: '',
  employmentType: 1,
  baseSalary: 0,
  bankAccount: '',
  emergencyName: '',
  emergencyPhone: '',
  remarks: '',
  status: 1,
})

const rules = {
  employeeNo: [{ required: true, message: '請輸入員工編號', trigger: 'blur' }],
  firstName: [{ required: true, message: '請輸入名字', trigger: 'blur' }],
  lastName: [{ required: true, message: '請輸入姓氏', trigger: 'blur' }],
  email: [{ required: true, type: 'email', message: '請輸入正確 Email', trigger: 'blur' }],
  departmentId: [{ required: true, message: '請選擇部門', trigger: 'change' }],
  positionId: [{ required: true, message: '請選擇職位', trigger: 'change' }],
  hireDate: [{ required: true, message: '請選擇到職日', trigger: 'change' }],
  baseSalary: [{ required: true, message: '請輸入基本薪資', trigger: 'blur' }],
}

function formatCurrency(value: number) {
  return `NT$ ${Number(value || 0).toLocaleString()}`
}

function statusType(value: number) {
  return value === 1 ? 'success' : value === 3 ? 'danger' : 'warning'
}

function resetForm() {
  Object.assign(form, {
    employeeNo: '',
    firstName: '',
    lastName: '',
    gender: 0,
    birthDate: '',
    idCardNo: '',
    email: '',
    phone: '',
    address: '',
    departmentId: undefined,
    positionId: undefined,
    managerId: undefined,
    hireDate: '',
    resignDate: '',
    employmentType: 1,
    baseSalary: 0,
    bankAccount: '',
    emergencyName: '',
    emergencyPhone: '',
    remarks: '',
    status: 1,
  })
}

function fillForm(emp: Employee) {
  Object.assign(form, {
    employeeNo: emp.employeeNo,
    firstName: emp.firstName || '',
    lastName: emp.lastName || '',
    gender: emp.gender ?? 0,
    birthDate: emp.birthDate || '',
    idCardNo: emp.idCardNo || '',
    email: emp.email,
    phone: emp.phone || '',
    address: emp.address || '',
    departmentId: emp.departmentId,
    positionId: emp.positionId,
    managerId: emp.managerId,
    hireDate: emp.hireDate,
    resignDate: emp.resignDate || '',
    employmentType: emp.employmentType ?? 1,
    baseSalary: emp.baseSalary,
    bankAccount: emp.bankAccount || '',
    emergencyName: emp.emergencyName || '',
    emergencyPhone: emp.emergencyPhone || '',
    remarks: emp.remarks || '',
    status: emp.status,
  })
}

async function fetchData() {
  loading.value = true
  try {
    const res = await employeeApi.getAll(query)
    employees.value = res.data.items
    total.value = res.data.total
  } finally {
    loading.value = false
  }
}

async function openDialog(emp?: Employee) {
  editMode.value = Boolean(emp)
  editId.value = emp?.id
  resetForm()

  if (emp) {
    try {
      const res = await employeeApi.getById(emp.id)
      fillForm(res.data)
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || '取得員工詳情失敗')
      return
    }
  }

  dialogVisible.value = true
}

function buildPayload() {
  const payload: Record<string, unknown> = {
    employeeNo: form.employeeNo,
    firstName: form.firstName,
    lastName: form.lastName,
    gender: form.gender,
    birthDate: form.birthDate || null,
    idCardNo: form.idCardNo || null,
    email: form.email,
    phone: form.phone || null,
    address: form.address || null,
    departmentId: form.departmentId,
    positionId: form.positionId,
    managerId: form.managerId || null,
    hireDate: form.hireDate,
    employmentType: form.employmentType,
    baseSalary: form.baseSalary,
    bankAccount: form.bankAccount || null,
    emergencyName: form.emergencyName || null,
    emergencyPhone: form.emergencyPhone || null,
    remarks: form.remarks || null,
  }

  if (editMode.value) {
    payload.status = form.status
    payload.resignDate = form.resignDate || null
  }

  return payload
}

async function handleSubmit() {
  await formRef.value.validate()
  submitting.value = true
  try {
    const payload = buildPayload()
    if (editMode.value && editId.value) {
      await employeeApi.update(editId.value, payload)
      ElMessage.success('員工已更新')
    } else {
      await employeeApi.create(payload)
      ElMessage.success('員工已新增')
    }
    dialogVisible.value = false
    fetchData()
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '儲存員工失敗')
  } finally {
    submitting.value = false
  }
}

async function handleDelete(emp: Employee) {
  await ElMessageBox.confirm(`確定將 ${emp.fullName} 標記為離職？`, '確認', { type: 'warning' })
  await employeeApi.delete(emp.id)
  ElMessage.success('已標記為離職')
  fetchData()
}

function viewDetail(id: number) {
  router.push(`/employees/${id}`)
}

onMounted(async () => {
  const [deptRes, posRes] = await Promise.all([
    departmentApi.getAll(),
    positionApi.getAll(),
  ])
  departments.value = deptRes.data
  positions.value = posRes.data
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
:deep(.el-dialog__title), :deep(.el-form-item__label) { color: #94a3b8; }
:deep(.el-input__wrapper), :deep(.el-textarea__inner) { background: #0f172a; border-color: #334155; color: #f1f5f9; }
:deep(.el-select .el-input__wrapper) { background: #0f172a; }
:deep(.el-pagination) { color: #64748b; }
</style>
