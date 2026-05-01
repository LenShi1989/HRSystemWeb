// src/stores/app.ts
import { defineStore as ds } from 'pinia'
import { ref } from 'vue'

export const useAppStore = ds('app', () => {
  const sidebarCollapsed = ref(false)
  const loading          = ref(false)

  function toggleSidebar() { sidebarCollapsed.value = !sidebarCollapsed.value }

  return { sidebarCollapsed, loading, toggleSidebar }
})

