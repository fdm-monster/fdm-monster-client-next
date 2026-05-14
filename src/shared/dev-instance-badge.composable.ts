import { computed } from 'vue'
import { useAuthStore } from '@/store/auth.store'

const isDevClient = import.meta.env.DEV

export function useDevInstanceBadge() {
  const authStore = useAuthStore()

  const backendLabel = computed(() => {
    const explicit = authStore.instanceLabel?.trim()
    if (explicit) return explicit
    if (authStore.isDemoMode) return 'DEMO'
    return null
  })

  const danger = computed(() => isDevClient && !backendLabel.value)

  const palette = computed<'red' | 'amber' | null>(() => {
    if (danger.value) return 'red'
    if (backendLabel.value) return 'amber'
    return null
  })

  const serverChip = computed(() => backendLabel.value)

  const clientChip = computed(() => {
    if (!isDevClient) return null
    return danger.value ? 'DEV CLIENT → PROD SERVER' : 'DEV CLIENT'
  })

  return { palette, serverChip, clientChip }
}
