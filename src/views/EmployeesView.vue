<template>
  <div class="page">
    <div class="page-header">
      <h2 class="page-title">員工管理</h2>
      <el-button type="primary" :icon="Plus" @click="openDialog()">新增員工</el-button>
    </div>

    <!-- Filters -->
    <div class="filter-bar">
      <el-input v-model="query.keyword" placeholder="搜尋姓名/員工編號/Email" clearable
        :prefix-icon="Search" style="width: 260px" @change="fetchData" />
      <el-select v-model="query.departmentId" placeholder="部門" clearable style="width: 160px"
        @change="fetchData">
        <el-option v-for="d in departments" :key="d.id" :label="d.name" :value="d.id" />
      </el-select>
      <el-select v-model="query.status" placeholder="狀態" clearable style="width: 120px"
        @change="fetchData">
        <el-option label="在職" :value="1" />
        <el-option label="留職停薪" :value="2" />
        <el-option label="離職" :value="3" />
      </el-select>
    </div>

    <!-- Table -->
    <div class="table-card">
      <el-table :data="employees" v-loading="loading" style="width: 100%"
        row-class-name="table-row">
        <el-table-column prop="employeeNo" label="員工編號" width="110" />
        <el-table-column prop="fullName" label="姓名" width="100" />
        <el-table-column prop="departmentName" label="部門" width="130" />
        <el-table-column prop="positionTitle" label="職位" width="130" />
        <el-table-column prop="email" label="Email" min-width="180" />
        <el-table-column prop="phone" label="電話" width="130" />
        <el-table-column prop="hireDate" label="到職日" width="110" />
        <el-table-column prop="baseSalary" label="底薪" width="110">
          <template #default="{ row }">
            {{ formatCurrency(row.baseSalary) }}
          </template>
        </el-table-column>
        <el-table-column label="狀態" width="90">
          <template #default="{ row }">
            <el-tag
              :type="row.status === 1 ? 'success' : row.status === 3 ? 'danger' : 'warning'"
              size="small"
            >{{ row.statusLabel }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" fixed="right">
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

    <!-- Create / Edit Dialog -->
    <el-dialog v-model="dialogVisible" :title="editMode ? '編輯員工' : '新增員工'"
      width="720px" destroy-on-close>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px" size="default">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="員工編號" prop="employeeNo">
              <el-input v-model="form.employeeNo" :disabled="editMode" />
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
            <el-form-item label="到職日" prop="hireDate">
              <el-date-picker v-model="form.hireDate" type="date" value-format="YYYY-MM-DD"
                style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="底薪" prop="baseSalary">
              <el-input-number v-model="form.baseSalary" :min="0" :step="1000"
                style="width: 100%" />
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
          <el-col :span="12" v-if="editMode">
            <el-form-item label="狀態">
              <el-select v-model="form.status" style="width: 100%">
                <el-option label="在職" :value="1" />
                <el-option label="留職停薪" :value="2" />
                <el-option label="離職" :value="3" />
              </el-select>
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
        <el-button type="primary" :loading="submitting" @click="handleSubmit">確認</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import { employeeApi, departmentApi, positionApi } from '@/services/api'
import type { Employee, Department, Position } from '@/services/api'

const router = useRouter()
const loading    = ref(false)
const submitting = ref(false)
const employees  = ref<Employee[]>([])
const departments = ref<Department[]>([])
const positions  = ref<Position[]>([])
const total      = ref(0)
const dialogVisible = ref(false)
const editMode   = ref(false)
const editId     = ref<number>()
const formRef    = ref()

const query = reactive({ keyword: '', departmentId: undefined as number | undefined,
  status: undefined as number | undefined, page: 1, pageSize: 20 })

const form = reactive({
  employeeNo: '', firstName: '', lastName: '', gender: 0,
  email: '', phone: '', address: '',
  departmentId: undefined as number | undefined,
  positionId: undefined as number | undefined,
  hireDate: '', employmentType: 1, baseSalary: 0,
  emergencyName: '', emergencyPhone: '', remarks: '',
  status: 1,
})

const rules = {
  employeeNo:   [{ required: true, message: '必填' }],
  firstName:    [{ required: true, message: '必填' }],
  lastName:     [{ required: true, message: '必填' }],
  email:        [{ required: true, type: 'email', message: '請輸入正確Email' }],
  departmentId: [{ required: true, message: '必填' }],
  positionId:   [{ required: true, message: '必填' }],
  hireDate:     [{ required: true, message: '必填' }],
  baseSalary:   [{ required: true, message: '必填' }],
}

function formatCurrency(v: number) {
  return `NT$ ${v.toLocaleString()}`
}

async function fetchData() {
  loading.value = true
  try {
    const res = await employeeApi.getAll(query)
    employees.value = res.data.items
    total.value     = res.data.total
  } finally {
    loading.value = false
  }
}

function openDialog(emp?: Employee) {
  editMode.value = !!emp
  editId.value = emp?.id
  if (emp) {
    Object.assign(form, {
      employeeNo: emp.employeeNo, firstName: emp.firstName, lastName: emp.lastName,
      gender: emp.gender, email: emp.email, phone: emp.phone ?? '',
      address: emp.address ?? '', departmentId: emp.departmentId,
      positionId: emp.positionId, hireDate: emp.hireDate,
      employmentType: emp.employmentType, baseSalary: emp.baseSalary,
      emergencyName: emp.emergencyName ?? '', emergencyPhone: emp.emergencyPhone ?? '',
      remarks: emp.remarks ?? '', status: emp.status,
    })
  } else {
    Object.assign(form, {
      employeeNo: '', firstName: '', lastName: '', gender: 0,
      email: '', phone: '', address: '', departmentId: undefined,
      positionId: undefined, hireDate: '', employmentType: 1, baseSalary: 0,
      emergencyName: '', emergencyPhone: '', remarks: '', status: 1,
    })
  }
  dialogVisible.value = true
}

async function handleSubmit() {
  await formRef.value.validate()
  submitting.value = true
  try {
    if (editMode.value && editId.value) {
      await employeeApi.update(editId.value, form)
      ElMessage.success('更新成功')
    } else {
      await employeeApi.create(form)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    fetchData()
  } catch (e: any) {
    ElMessage.error(e.response?.data?.message || '操作失敗')
  } finally {
    submitting.value = false
  }
}

async function handleDelete(emp: Employee) {
  await ElMessageBox.confirm(`確定將「${emp.fullName}」設為離職？`, '確認', { type: 'warning' })
  await employeeApi.delete(emp.id)
  ElMessage.success('已設為離職')
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
  positions.value   = posRes.data
  fetchData()
})
</script>

<style scoped>
.page { }
.page-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 20px;
}
.page-title { color: #f1f5f9; font-size: 20px; font-weight: 600; margin: 0; }
.filter-bar {
  display: flex; gap: 12px; flex-wrap: wrap;
  margin-bottom: 16px;
}
.table-card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 20px;
}
:deep(.el-table) { background: transparent !important; color: #94a3b8; }
:deep(.el-table tr) { background: transparent !important; }
:deep(.el-table th.el-table__cell) { background: #0f172a !important; color: #64748b; border-bottom: 1px solid #334155; }
:deep(.el-table td.el-table__cell) { border-bottom-color: #334155; }
:deep(.el-table--enable-row-hover .el-table__body tr:hover > td) {
  background: rgba(59,130,246,0.05) !important;
}
:deep(.el-dialog) { background: #1e293b; border: 1px solid #334155; }
:deep(.el-dialog__title) { color: #f1f5f9; }
:deep(.el-form-item__label) { color: #94a3b8; }
:deep(.el-input__wrapper) { background: #0f172a; border-color: #334155; }
:deep(.el-input__inner) { color: #f1f5f9; }
:deep(.el-select .el-input__wrapper) { background: #0f172a; }
:deep(.el-pagination) { color: #64748b; }
</style>
