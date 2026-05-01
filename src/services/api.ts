// src/services/api.ts
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
})

api.interceptors.request.use(config => {
  const auth = useAuthStore()
  if (auth.token) {
    config.headers.Authorization = `Bearer ${auth.token}`
  }
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      useAuthStore().logout()
      router.push('/login')
    }
    return Promise.reject(err)
  }
)

// ── Types ─────────────────────────────────────────────────────

export interface PagedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export interface Employee {
  id: number
  employeeNo: string
  firstName: string
  lastName: string
  fullName: string
  gender: number
  birthDate?: string
  email: string
  phone?: string
  address?: string
  photo?: string
  departmentId: number
  departmentName: string
  positionId: number
  positionTitle: string
  managerId?: number
  managerName?: string
  hireDate: string
  resignDate?: string
  employmentType: number
  status: number
  statusLabel: string
  baseSalary: number
  bankAccount?: string
  emergencyName?: string
  emergencyPhone?: string
  remarks?: string
}

export interface Department {
  id: number
  name: string
  code: string
  description?: string
  managerId?: number
  managerName?: string
  employeeCount: number
  isActive: boolean
}

export interface Position {
  id: number
  title: string
  code: string
  level: number
  minSalary?: number
  maxSalary?: number
  description?: string
  isActive: boolean
}

export interface Attendance {
  id: number
  employeeId: number
  employeeName: string
  attendDate: string
  checkIn?: string
  checkOut?: string
  workHours?: number
  status: number
  statusLabel: string
  remarks?: string
}

export interface LeaveRequest {
  id: number
  employeeId: number
  employeeName: string
  leaveType: number
  leaveTypeLabel: string
  startDate: string
  endDate: string
  days: number
  reason?: string
  status: number
  statusLabel: string
  approverId?: number
  approverName?: string
  approvedAt?: string
  approveNote?: string
  createdAt: string
}

export interface Payroll {
  id: number
  employeeId: number
  employeeName: string
  payYear: number
  payMonth: number
  baseSalary: number
  bonus: number
  allowance: number
  overtime: number
  deduction: number
  insurance: number
  tax: number
  netSalary: number
  status: number
  paidAt?: string
  remarks?: string
}

// ── API Functions ─────────────────────────────────────────────

// Auth
export const authApi = {
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),
}

// Employees
export const employeeApi = {
  getAll: (params?: Record<string, unknown>) =>
    api.get<PagedResult<Employee>>('/employees', { params }),
  getById: (id: number) => api.get<Employee>(`/employees/${id}`),
  create: (data: unknown) => api.post('/employees', data),
  update: (id: number, data: unknown) => api.put(`/employees/${id}`, data),
  delete: (id: number) => api.delete(`/employees/${id}`),
  getStats: () => api.get('/employees/stats'),
}

// Departments
export const departmentApi = {
  getAll: () => api.get<Department[]>('/departments'),
  getById: (id: number) => api.get<Department>(`/departments/${id}`),
  create: (data: unknown) => api.post('/departments', data),
  update: (id: number, data: unknown) => api.put(`/departments/${id}`, data),
}

// Positions
export const positionApi = {
  getAll: () => api.get<Position[]>('/positions'),
  create: (data: unknown) => api.post('/positions', data),
  update: (id: number, data: unknown) => api.put(`/positions/${id}`, data),
}

// Attendances
export const attendanceApi = {
  getAll: (params?: Record<string, unknown>) =>
    api.get<PagedResult<Attendance>>('/attendances', { params }),
  upsert: (data: unknown) => api.post('/attendances', data),
}

// Leave Requests
export const leaveApi = {
  getAll: (params?: Record<string, unknown>) =>
    api.get<PagedResult<LeaveRequest>>('/leaverequests', { params }),
  create: (data: unknown) => api.post('/leaverequests', data),
  approve: (id: number, data: unknown) =>
    api.patch(`/leaverequests/${id}/approve`, data),
}

// Payrolls
export const payrollApi = {
  getAll: (params?: Record<string, unknown>) =>
    api.get<PagedResult<Payroll>>('/payrolls', { params }),
  create: (data: unknown) => api.post('/payrolls', data),
  markPaid: (id: number) => api.patch(`/payrolls/${id}/pay`, {}),
}

export default api
