import { computed } from 'vue'
import { useAuthStore } from '@/store/auth.store'

const isDevClient = import.meta.env.DEV
const envInstanceLabel = (import.meta.env.VITE_INSTANCE_LABEL as string | undefined)?.trim() || null

function isLightHex(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5
}

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
      return `DEV CLIENT → ${label ? `${label} SERVER` : 'PROD SERVER'}`
    }
    return label ? `${label} SERVER` : null
  })

  const onPalette = computed<'white' | 'black'>(() => {
    const p = palette.value
    if (p?.startsWith('#') && isLightHex(p)) return 'black'
    return 'white'
  })

  return { palette, chipText, onPalette }
}
