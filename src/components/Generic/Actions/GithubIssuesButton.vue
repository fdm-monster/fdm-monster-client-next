<template>
  <v-btn
    v-bind="$attrs"
    href="https://github.com/fdm-monster/fdm-monster/issues"
    target="_blank"
    :color="color"
    :variant="variant"
    :size="size"
    :block="block"
  >
    <v-icon v-if="!iconOnly" class="mr-2">mdi:mdi-github</v-icon>
    <v-icon v-else>mdi:mdi-github</v-icon>
    <span v-if="!iconOnly">{{ label }}</span>
  </v-btn>
</template>

<script lang="ts" setup>
interface Props {
  label?: string
  color?: string
  variant?: 'elevated' | 'flat' | 'tonal' | 'outlined' | 'text' | 'plain'
  size?: 'x-small' | 'small' | 'default' | 'large' | 'x-large'
  block?: boolean
  iconOnly?: boolean
}

withDefaults(defineProps<Props>(), {
  label: 'Report Issue on GitHub',
  color: undefined,
  variant: 'tonal',
  size: 'default',
  block: false,
  iconOnly: false
})
</script>
