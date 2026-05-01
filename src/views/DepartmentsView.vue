<template>
  <div class="page">
    <div class="page-header">
      <h2 class="page-title">部門管理</h2>
      <el-button type="primary" :icon="Plus" @click="openDialog()">新增部門</el-button>
    </div>

    <div class="table-card">
      <el-table :data="departments" v-loading="loading" style="width: 100%">
        <el-table-column prop="code" label="部門代碼" width="120" />
        <el-table-column prop="name" label="部門名稱" width="160" />
        <el-table-column prop="managerName" label="主管" width="140">
          <template #default="{ row }">{{ row.managerName || '-' }}</template>
        </el-table-column>
        <el-table-column prop="employeeCount" label="員工數" width="100" />
        <el-table-column prop="description" label="描述" min-width="220">
          <template #default="{ row }">{{ row.description || '-' }}</template>
        </el-table-column>
        <el-table-column label="狀態" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isActive ? 'success' : 'info'" size="small">
              {{ row.isActive ? '啟用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="110" fixed="right">
          <template #default="{ row }">
            <el-button text size="small" type="primary" @click="openDialog(row)">
              編輯
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="editMode ? '編輯部門' : '新增部門'"
      width="560px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="部門代碼" prop="code">
          <el-input v-model="form.code" placeholder="例如 HR" />
        </el-form-item>
        <el-form-item label="部門名稱" prop="name">
          <el-input v-model="form.name" placeholder="例如 人力資源部" />
        </el-form-item>
        <el-form-item label="主管">
          <el-select
            v-model="form.managerId"
            clearable
            filterable
            placeholder="選擇主管"
            style="width: 100%"
          >
            <el-option
              v-for="employee in employees"
              :key="employee.id"
              :label="employee.fullName"
              :value="employee.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="狀態">
          <el-switch
            v-model="form.isActive"
            active-text="啟用"
            inactive-text="停用"
          />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          儲存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { departmentApi, employeeApi } from '@/services/api'
import type { Department, Employee } from '@/services/api'

const loading = ref(false)
const submitting = ref(false)
const departments = ref<Department[]>([])
const employees = ref<Employee[]>([])
const dialogVisible = ref(false)
const editMode = ref(false)
const editId = ref<number>()
const formRef = ref<FormInstance>()

const form = reactive({
  code: '',
  name: '',
  description: '',
  managerId: undefined as number | undefined,
  isActive: true,
})

const rules: FormRules = {
  code: [{ required: true, message: '請輸入部門代碼', trigger: 'blur' }],
  name: [{ required: true, message: '請輸入部門名稱', trigger: 'blur' }],
}

async function fetchDepartments() {
  loading.value = true
  try {
    const res = await departmentApi.getAll()
    departments.value = res.data
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '取得部門資料失敗')
  } finally {
    loading.value = false
  }
}

function openDialog(department?: Department) {
  editMode.value = Boolean(department)
  editId.value = department?.id
  Object.assign(form, {
    code: department?.code || '',
    name: department?.name || '',
    description: department?.description || '',
    managerId: department?.managerId,
    isActive: department?.isActive ?? true,
  })
  dialogVisible.value = true
}

async function handleSubmit() {
  await formRef.value?.validate()
  submitting.value = true
  try {
    if (editMode.value && editId.value) {
      await departmentApi.update(editId.value, form)
      ElMessage.success('部門已更新')
    } else {
      await departmentApi.create(form)
      ElMessage.success('部門已新增')
    }
    dialogVisible.value = false
    fetchDepartments()
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '儲存部門失敗')
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  fetchDepartments()
  try {
    const res = await employeeApi.getAll({ pageSize: 200, status: 1 })
    employees.value = res.data.items
  } catch {
    employees.value = []
  }
})
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.page-title {
  color: #f1f5f9;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}
.table-card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 20px;
}
:deep(.el-table) {
  background: transparent !important;
  color: #94a3b8;
}
:deep(.el-table tr) {
  background: transparent !important;
}
:deep(.el-table th.el-table__cell) {
  background: #0f172a !important;
  color: #64748b;
  border-bottom: 1px solid #334155;
}
:deep(.el-table td.el-table__cell) {
  border-bottom-color: #334155;
}
:deep(.el-table--enable-row-hover .el-table__body tr:hover > td) {
  background: rgba(59, 130, 246, 0.05) !important;
}
:deep(.el-dialog) {
  background: #1e293b;
  border: 1px solid #334155;
}
:deep(.el-dialog__title),
:deep(.el-form-item__label) {
  color: #f1f5f9;
}
:deep(.el-input__wrapper),
:deep(.el-textarea__inner) {
  background: #0f172a;
  border-color: #334155;
  color: #f1f5f9;
}
</style>
