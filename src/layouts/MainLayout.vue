<template>
  <el-container class="main-layout">
    <el-aside :width="sidebarWidth" class="sidebar">
      <div class="logo" :class="{ collapsed: appStore.sidebarCollapsed }">
        <el-icon size="28" color="#60a5fa"><OfficeBuilding /></el-icon>
        <span v-if="!appStore.sidebarCollapsed" class="logo-text">人資管理系統</span>
      </div>

      <el-menu
        :default-active="activeMenu"
        router
        :collapse="appStore.sidebarCollapsed"
        background-color="transparent"
        text-color="#94a3b8"
        active-text-color="#60a5fa"
        class="sidebar-menu"
      >
        <el-menu-item v-for="item in visibleMenuItems" :key="item.path" :index="item.path">
          <el-icon><component :is="item.icon" /></el-icon>
          <template #title>{{ item.title }}</template>
        </el-menu-item>
      </el-menu>

      <div class="sidebar-footer">
        <el-button
          :icon="appStore.sidebarCollapsed ? 'Expand' : 'Fold'"
          text
          style="color: #64748b; width: 100%"
          @click="appStore.toggleSidebar()"
        />
      </div>
    </el-aside>

    <el-container class="main-area">
      <el-header class="header">
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/dashboard' }">首頁</el-breadcrumb-item>
            <el-breadcrumb-item v-if="currentRoute?.meta?.title">
              {{ currentRoute.meta.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-tag type="success" size="small">{{ roleLabel }}</el-tag>
          <el-dropdown @command="handleCommand">
            <div class="user-info">
              <el-avatar size="small" style="background: #3b82f6">
                {{ authStore.empName?.charAt(0) || authStore.username?.charAt(0) }}
              </el-avatar>
              <span class="user-name">{{ authStore.empName || authStore.username }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  登出
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import {
  ArrowDown,
  Calendar,
  Expand,
  Fold,
  Money,
  Odometer,
  OfficeBuilding,
  Setting,
  SwitchButton,
  Tickets,
  User,
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const appStore = useAppStore()

const sidebarWidth = computed(() =>
  appStore.sidebarCollapsed ? '64px' : '220px',
)
const activeMenu = computed(() => '/' + route.path.split('/')[1])
const currentRoute = computed(() => route)
const roleLabel = computed(() =>
  authStore.isAdmin ? '管理員' : authStore.isHR ? 'HR' : '一般使用者',
)

const menuItems = [
  { path: '/dashboard', title: '儀表板', icon: 'Odometer' },
  { path: '/employees', title: '員工管理', icon: 'User' },
  { path: '/departments', title: '部門管理', icon: 'OfficeBuilding' },
  { path: '/attendance', title: '考勤管理', icon: 'Calendar' },
  { path: '/leave', title: '請假管理', icon: 'Tickets' },
  { path: '/payroll', title: '薪資管理', icon: 'Money' },
  { path: '/users', title: '帳號管理', icon: 'Setting', adminOnly: true },
]

const visibleMenuItems = computed(() =>
  menuItems.filter(item => !item.adminOnly || authStore.isAdmin),
)

function handleCommand(cmd: string) {
  if (cmd === 'logout') {
    authStore.logout()
    router.push('/login')
  }
}
</script>

<style scoped>
.main-layout {
  height: 100vh;
  background: #0f172a;
}

.sidebar {
  background: #1e293b;
  border-right: 1px solid #334155;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  overflow: hidden;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 16px;
  border-bottom: 1px solid #334155;
  min-height: 64px;
  white-space: nowrap;
  overflow: hidden;
}

.logo.collapsed {
  justify-content: center;
}

.logo-text {
  color: #f1f5f9;
  font-size: 15px;
  font-weight: 600;
}

.sidebar-menu {
  border: none;
  flex: 1;
}

:deep(.el-menu-item) {
  border-radius: 8px;
  margin: 2px 8px;
}

:deep(.el-menu-item.is-active) {
  background: rgba(96, 165, 250, 0.15) !important;
}

.sidebar-footer {
  padding: 12px;
  border-top: 1px solid #334155;
}

.header {
  background: #1e293b;
  border-bottom: 1px solid #334155;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 64px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #94a3b8;
}

.user-name {
  font-size: 14px;
}

.content {
  background: #0f172a;
  padding: 24px;
  overflow-y: auto;
}

.main-area {
  overflow: hidden;
}

:deep(.el-breadcrumb__inner) {
  color: #64748b !important;
}

:deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
  color: #94a3b8 !important;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
