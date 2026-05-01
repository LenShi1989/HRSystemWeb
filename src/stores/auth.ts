// src/stores/auth.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const token     = ref(localStorage.getItem('hr_token') || '')
  const username  = ref(localStorage.getItem('hr_username') || '')
  const role      = ref(Number(localStorage.getItem('hr_role')) || 0)
  const empName   = ref(localStorage.getItem('hr_empname') || '')

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin    = computed(() => role.value >= 4)
  const isHR       = computed(() => role.value >= 2)

  async function login(usernameVal: string, password: string) {
    const res = await authApi.login(usernameVal, password)
    const data = res.data
    token.value    = data.token
    username.value = data.username
    role.value     = data.role
    empName.value  = data.employeeName || ''

    localStorage.setItem('hr_token',   data.token)
    localStorage.setItem('hr_username', data.username)
    localStorage.setItem('hr_role',    String(data.role))
    localStorage.setItem('hr_empname', data.employeeName || '')
  }

  function logout() {
    token.value = username.value = empName.value = ''
    role.value = 0
    localStorage.removeItem('hr_token')
    localStorage.removeItem('hr_username')
    localStorage.removeItem('hr_role')
    localStorage.removeItem('hr_empname')
  }

  return { token, username, role, empName, isLoggedIn, isAdmin, isHR, login, logout }
})
