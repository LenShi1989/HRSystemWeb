<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h2 class="page-title">員工詳情</h2>
        <p class="page-subtitle">{{ employee?.employeeNo || '載入中' }}</p>
      </div>
      <el-button :icon="ArrowLeft" @click="router.back()">返回</el-button>
    </div>

    <el-skeleton v-if="loading" :rows="8" animated />

    <template v-else-if="employee">
      <div class="profile-panel">
        <el-avatar :size="72" class="avatar">
          {{ employee.fullName?.charAt(0) }}
        </el-avatar>
        <div class="profile-main">
          <div class="profile-name">{{ employee.fullName }}</div>
          <div class="profile-meta">
            {{ employee.departmentName }} / {{ employee.positionTitle }}
          </div>
        </div>
        <el-tag :type="statusType(employee.status)" size="large">
          {{ employee.statusLabel || statusLabel(employee.status) }}
        </el-tag>
      </div>

      <el-row :gutter="20">
        <el-col :xs="24" :lg="12">
          <div class="section">
            <h3>基本資料</h3>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="員工編號">{{ employee.employeeNo }}</el-descriptions-item>
              <el-descriptions-item label="姓名">{{ employee.fullName }}</el-descriptions-item>
              <el-descriptions-item label="性別">{{ genderLabel(employee.gender) }}</el-descriptions-item>
              <el-descriptions-item label="生日">{{ employee.birthDate || '-' }}</el-descriptions-item>
              <el-descriptions-item label="Email">{{ employee.email }}</el-descriptions-item>
              <el-descriptions-item label="電話">{{ employee.phone || '-' }}</el-descriptions-item>
              <el-descriptions-item label="地址">{{ employee.address || '-' }}</el-descriptions-item>
            </el-descriptions>
          </div>
        </el-col>

        <el-col :xs="24" :lg="12">
          <div class="section">
            <h3>任職資料</h3>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="部門">{{ employee.departmentName }}</el-descriptions-item>
              <el-descriptions-item label="職位">{{ employee.positionTitle }}</el-descriptions-item>
              <el-descriptions-item label="主管">{{ employee.managerName || '-' }}</el-descriptions-item>
              <el-descriptions-item label="到職日">{{ employee.hireDate }}</el-descriptions-item>
              <el-descriptions-item label="離職日">{{ employee.resignDate || '-' }}</el-descriptions-item>
              <el-descriptions-item label="雇用類型">{{ employmentTypeLabel(employee.employmentType) }}</el-descriptions-item>
              <el-descriptions-item label="基本薪資">{{ formatCurrency(employee.baseSalary) }}</el-descriptions-item>
            </el-descriptions>
          </div>
        </el-col>

        <el-col :xs="24" :lg="12">
          <div class="section">
            <h3>緊急聯絡人</h3>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="姓名">{{ employee.emergencyName || '-' }}</el-descriptions-item>
              <el-descriptions-item label="電話">{{ employee.emergencyPhone || '-' }}</el-descriptions-item>
            </el-descriptions>
          </div>
        </el-col>

        <el-col :xs="24" :lg="12">
          <div class="section">
            <h3>備註</h3>
            <div class="remarks">{{ employee.remarks || '無備註' }}</div>
          </div>
        </el-col>
      </el-row>
    </template>

    <el-empty v-else description="找不到員工資料" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { employeeApi } from '@/services/api'
import type { Employee } from '@/services/api'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const employee = ref<Employee>()

function formatCurrency(value: number) {
  return `NT$ ${Number(value || 0).toLocaleString()}`
}

function genderLabel(value: number) {
  return value === 1 ? '男' : value === 2 ? '女' : '未設定'
}

function employmentTypeLabel(value: number) {
  const labels: Record<number, string> = {
    1: '正職',
    2: '約聘',
    3: '兼職',
  }
  return labels[value] || '未設定'
}

function statusLabel(value: number) {
  const labels: Record<number, string> = {
    1: '在職',
    2: '留職停薪',
    3: '離職',
  }
  return labels[value] || '未知'
}

function statusType(value: number) {
  return value === 1 ? 'success' : value === 3 ? 'danger' : 'warning'
}

onMounted(async () => {
  const id = Number(route.params.id)
  if (!id) {
    ElMessage.error('員工編號不正確')
    return
  }

  loading.value = true
  try {
    const res = await employeeApi.getById(id)
    employee.value = res.data
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '取得員工資料失敗')
  } finally {
    loading.value = false
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
.page-subtitle {
  color: #64748b;
  margin: 6px 0 0;
}
.profile-panel,
.section {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
}
.profile-panel {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 20px;
  margin-bottom: 20px;
}
.avatar {
  background: #3b82f6;
  color: #fff;
  font-size: 28px;
}
.profile-main {
  flex: 1;
}
.profile-name {
  color: #f1f5f9;
  font-size: 24px;
  font-weight: 700;
}
.profile-meta {
  color: #94a3b8;
  margin-top: 4px;
}
.section {
  padding: 20px;
  margin-bottom: 20px;
}
.section h3 {
  color: #94a3b8;
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 16px;
}
.remarks {
  min-height: 92px;
  color: #cbd5e1;
  line-height: 1.7;
}
:deep(.el-descriptions__label.el-descriptions__cell) {
  width: 120px;
  background: #0f172a;
  color: #94a3b8;
}
:deep(.el-descriptions__content.el-descriptions__cell) {
  background: #1e293b;
  color: #f1f5f9;
}
:deep(.el-descriptions__body .el-descriptions__table) {
  border-color: #334155;
}
</style>
