<template>
  <v-btn
    v-bind="$attrs"
    href="https://discord.gg/mwA8uP8CMc"
    target="_blank"
    :color="color"
    :variant="variant"
    :size="size"
    :block="block"
  >
    <v-icon :class="iconOnly ? '' : 'mr-2'">discord</v-icon>
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
  label: 'Join our Discord',
  color: 'indigo',
  variant: 'elevated',
  size: 'default',
  block: false,
  iconOnly: false
})
</script>
