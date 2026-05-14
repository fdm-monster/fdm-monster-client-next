import { computed } from 'vue'
import { useAuthStore } from '@/store/auth.store'

const isDevClient = import.meta.env.DEV
const envInstanceLabel = import.meta.env.VITE_SERVER_INSTANCE_LABEL?.trim() || null

export function useDevInstanceBadge() {
  const authStore = useAuthStore()

  const backendLabel = computed(() => {
    const explicit = authStore.instanceLabel?.trim()
    if (explicit) return explicit
    if (authStore.isDemoMode) return 'DEMO'
    if (envInstanceLabel) return envInstanceLabel
    return null
  })

  const danger = computed(() => isDevClient && !backendLabel.value)

  const palette = computed(() => {
    if (danger.value) return '#5A0000'
    if (backendLabel.value) return '#6B4300'
    return null
  })

  const chipText = computed(() => {
    const label = backendLabel.value
    if (isDevClient) {
      const serverLabel = label ? `${label} SERVER` : 'PROD SERVER'
      return `DEV CLIENT → ${serverLabel}`
    }
    return label ? `${label} SERVER` : null
  })

  return { palette, chipText }
}
