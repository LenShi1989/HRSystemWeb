// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/',
      component: () => import('@/layouts/MainLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          redirect: '/dashboard',
        },
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('@/views/DashboardView.vue'),
          meta: { title: '儀表板', icon: 'Odometer' },
        },
        {
          path: 'employees',
          name: 'Employees',
          component: () => import('@/views/EmployeesView.vue'),
          meta: { title: '員工管理', icon: 'User' },
        },
        {
          path: 'employees/:id',
          name: 'EmployeeDetail',
          component: () => import('@/views/EmployeeDetailView.vue'),
          meta: { title: '員工詳情' },
        },
        {
          path: 'departments',
          name: 'Departments',
          component: () => import('@/views/DepartmentsView.vue'),
          meta: { title: '部門管理', icon: 'OfficeBuilding' },
        },
        {
          path: 'attendance',
          name: 'Attendance',
          component: () => import('@/views/AttendanceView.vue'),
          meta: { title: '考勤管理', icon: 'Calendar' },
        },
        {
          path: 'leave',
          name: 'Leave',
          component: () => import('@/views/LeaveView.vue'),
          meta: { title: '請假管理', icon: 'Tickets' },
        },
        {
          path: 'payroll',
          name: 'Payroll',
          component: () => import('@/views/PayrollView.vue'),
          meta: { title: '薪資管理', icon: 'Money' },
        },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach((to, _from, next) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth !== false && !auth.isLoggedIn) {
    next('/login')
  } else {
    next()
  }
})

export default router
