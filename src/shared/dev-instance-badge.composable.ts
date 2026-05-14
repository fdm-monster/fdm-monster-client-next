import { computed } from 'vue'
import { useAuthStore } from '@/store/auth.store'

const isDevClient = import.meta.env.DEV

export function useDevInstanceBadge() {
  const authStore = useAuthStore()

  const instanceLabel = computed(() => {
    const raw = authStore.instanceLabel
    return raw?.trim() || null
  })

  const danger = computed(() => isDevClient && !instanceLabel.value)

  const palette = computed<'red' | 'amber' | null>(() => {
    if (danger.value) return 'red'
    if (instanceLabel.value) return 'amber'
    return null
  })

  const serverChip = computed(() => instanceLabel.value)

  const clientChip = computed(() => {
    if (!isDevClient) return null
    return danger.value ? 'DEV CLIENT → PROD' : 'DEV CLIENT'
  })

  return { palette, serverChip, clientChip }
}
