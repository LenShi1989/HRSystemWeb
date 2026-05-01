<template>
  <div class="page">
    <div class="page-header">
      <h2 class="page-title">帳號管理</h2>
      <el-button type="primary" :icon="Plus" @click="openDialog()">新增帳號</el-button>
    </div>

    <div class="table-card">
      <el-table :data="users" v-loading="loading" style="width: 100%">
        <el-table-column prop="username" label="帳號" width="160" />
        <el-table-column prop="employeeName" label="綁定員工" min-width="160">
          <template #default="{ row }">{{ row.employeeName || '-' }}</template>
        </el-table-column>
        <el-table-column label="角色" width="120">
          <template #default="{ row }">
            <el-tag :type="roleTagType(row.role)" size="small">{{ roleLabel(row.role) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="狀態" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isActive ? 'success' : 'info'" size="small">
              {{ row.isActive ? '啟用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="最後登入" width="170">
          <template #default="{ row }">{{ formatDateTime(row.lastLoginAt) }}</template>
        </el-table-column>
        <el-table-column label="建立時間" width="170">
          <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="190" fixed="right">
          <template #default="{ row }">
            <el-button text size="small" type="primary" @click="openDialog(row)">編輯</el-button>
            <el-button text size="small" @click="openPasswordDialog(row)">重設密碼</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="dialogVisible" :title="editMode ? '編輯帳號' : '新增帳號'" width="560px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="帳號" prop="username">
          <el-input v-model="form.username" :disabled="editMode" />
        </el-form-item>
        <el-form-item v-if="!editMode" label="密碼" prop="password">
          <el-input v-model="form.password" type="password" show-password />
        </el-form-item>
        <el-form-item label="綁定員工">
          <el-select v-model="form.employeeId" clearable filterable placeholder="可不綁定員工" style="width: 100%">
            <el-option v-for="employee in employees" :key="employee.id" :label="employee.fullName" :value="employee.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" style="width: 100%">
            <el-option v-for="role in roles" :key="role.value" :label="role.label" :value="role.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="狀態">
          <el-switch v-model="form.isActive" active-text="啟用" inactive-text="停用" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">儲存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="passwordDialogVisible" title="重設密碼" width="420px" destroy-on-close>
      <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-width="90px">
        <el-form-item label="帳號">
          <el-input :model-value="selectedUser?.username" disabled />
        </el-form-item>
        <el-form-item label="新密碼" prop="password">
          <el-input v-model="passwordForm.password" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="passwordDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submittingPassword" @click="handleResetPassword">更新密碼</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { employeeApi, userApi } from '@/services/api'
import type { Employee, UserAccount } from '@/services/api'

const loading = ref(false)
const submitting = ref(false)
const submittingPassword = ref(false)
const users = ref<UserAccount[]>([])
const employees = ref<Employee[]>([])
const dialogVisible = ref(false)
const passwordDialogVisible = ref(false)
const editMode = ref(false)
const editId = ref<number>()
const selectedUser = ref<UserAccount>()
const formRef = ref<FormInstance>()
const passwordFormRef = ref<FormInstance>()

const roles = [
  { label: '一般使用者', value: 1 },
  { label: 'HR', value: 2 },
  { label: '主管', value: 3 },
  { label: '管理員', value: 4 },
]

const form = reactive({
  username: '',
  password: '',
  employeeId: undefined as number | undefined,
  role: 1,
  isActive: true,
})

const passwordForm = reactive({
  password: '',
})

const rules: FormRules = {
  username: [{ required: true, message: '請輸入帳號', trigger: 'blur' }],
  password: [{ required: true, min: 6, message: '密碼至少 6 碼', trigger: 'blur' }],
  role: [{ required: true, message: '請選擇角色', trigger: 'change' }],
}

const passwordRules: FormRules = {
  password: [{ required: true, min: 6, message: '密碼至少 6 碼', trigger: 'blur' }],
}

function roleLabel(value: number) {
  return roles.find(role => role.value === value)?.label || '未知'
}

function roleTagType(value: number) {
  return value >= 4 ? 'danger' : value >= 2 ? 'warning' : 'info'
}

function formatDateTime(value?: string | null) {
  return value ? value.replace('T', ' ').slice(0, 16) : '-'
}

async function fetchUsers() {
  loading.value = true
  try {
    const res = await userApi.getAll()
    users.value = res.data
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '取得帳號資料失敗')
  } finally {
    loading.value = false
  }
}

function openDialog(user?: UserAccount) {
  editMode.value = Boolean(user)
  editId.value = user?.id
  Object.assign(form, {
    username: user?.username || '',
    password: '',
    employeeId: user?.employeeId || undefined,
    role: user?.role ?? 1,
    isActive: user?.isActive ?? true,
  })
  dialogVisible.value = true
}

function openPasswordDialog(user: UserAccount) {
  selectedUser.value = user
  passwordForm.password = ''
  passwordDialogVisible.value = true
}

function buildPayload() {
  const payload: Record<string, unknown> = {
    username: form.username,
    employeeId: form.employeeId || null,
    role: form.role,
    isActive: form.isActive,
  }

  if (!editMode.value) {
    payload.password = form.password
  }

  return payload
}

async function handleSubmit() {
  await formRef.value?.validate()
  submitting.value = true
  try {
    if (editMode.value && editId.value) {
      await userApi.update(editId.value, buildPayload())
      ElMessage.success('帳號已更新')
    } else {
      await userApi.create(buildPayload())
      ElMessage.success('帳號已新增')
    }
    dialogVisible.value = false
    fetchUsers()
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '儲存帳號失敗')
  } finally {
    submitting.value = false
  }
}

async function handleResetPassword() {
  await passwordFormRef.value?.validate()
  if (!selectedUser.value) return

  submittingPassword.value = true
  try {
    await userApi.resetPassword(selectedUser.value.id, { password: passwordForm.password })
    ElMessage.success('密碼已更新')
    passwordDialogVisible.value = false
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '更新密碼失敗')
  } finally {
    submittingPassword.value = false
  }
}

onMounted(async () => {
  fetchUsers()
  try {
    const res = await employeeApi.getAll({ pageSize: 500 })
    employees.value = res.data.items
  } catch {
    employees.value = []
  }
})
</script>

<style scoped>
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.page-title { color: #f1f5f9; font-size: 20px; font-weight: 600; margin: 0; }
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
