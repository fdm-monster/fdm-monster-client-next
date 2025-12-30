<template>
  <v-select
    v-if="groups.length || !hideWhenEmpty"
    :model-value="modelValue"
    :items="groups"
    item-title="name"
    item-value="id"
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
    :class="className"
    :style="style"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>

<script setup lang="ts">
import type { GroupDto } from '@/backend/printer-group.service'

withDefaults(defineProps<{
  modelValue: number[]
  groups: GroupDto[]
  label?: string
  prependInnerIcon?: string
  prependIcon?: string
  variant?: string
  density?: string
  multiple?: boolean
  chips?: boolean
  closableChips?: boolean
  clearable?: boolean
  hideDetails?: boolean
  className?: string
  style?: string
  hideWhenEmpty?: boolean
}>(), {
  label: 'Filter by tags',
  prependInnerIcon: 'label',
  variant: 'outlined',
  density: 'compact',
  multiple: true,
  chips: true,
  closableChips: true,
  clearable: true,
  hideDetails: true,
  hideWhenEmpty: true
})

defineEmits<{
  'update:modelValue': [value: number[]]
}>()
</script>
