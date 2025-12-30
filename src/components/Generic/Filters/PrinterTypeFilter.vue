<template>
  <v-select
    v-bind="$attrs"
    :model-value="modelValue"
    :items="printerTypes"
    item-title="name"
    item-value="value"
    :label="label"
    :prepend-inner-icon="prependInnerIcon"
    :prepend-icon="prependIcon"
    :variant="variant"
    :density="density"
    :multiple="multiple"
    :chips="chips"
    :closable-chips="closableChips"
    :clearable="clearable"
    :hide-details="hideDetails"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>

<script setup lang="ts">
import { PRINTER_TYPES } from '@/shared/printer-types.constants'

defineOptions({
  inheritAttrs: false
})

withDefaults(defineProps<{
  modelValue: number[]
  label?: string
  prependInnerIcon?: string
  prependIcon?: string
  variant?: "filled" | "outlined" | "plain" | "solo" | "solo-filled" | "solo-inverted" | "underlined"
  density?: null | 'default' | 'comfortable' | 'compact'
  multiple?: boolean
  chips?: boolean
  closableChips?: boolean
  clearable?: boolean
  hideDetails?: boolean
}>(), {
  label: 'Filter by type',
  prependInnerIcon: 'category',
  variant: 'outlined',
  density: 'compact',
  multiple: true,
  chips: true,
  closableChips: true,
  clearable: true,
  hideDetails: true
})

const printerTypes = PRINTER_TYPES

defineEmits<{
  'update:modelValue': [value: number[]]
}>()
</script>
