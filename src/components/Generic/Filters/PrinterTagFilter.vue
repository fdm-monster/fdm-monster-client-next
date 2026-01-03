<template>
  <v-select
    v-if="tags.length || !hideWhenEmpty"
    v-bind="$attrs"
    :model-value="modelValue"
    :items="tags"
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
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #chip="{ item, props }">
      <v-chip
        v-bind="props"
        :color="item.raw.color"
      >
        {{ item.title }}
      </v-chip>
    </template>
    <template #item="{ item, props }">
      <v-list-item v-bind="props">
        <template #prepend>
          <v-chip
            :color="item.raw.color"
            size="x-small"
            variant="flat"
            class="mr-2"
          >
            <v-icon size="x-small">label</v-icon>
          </v-chip>
        </template>
      </v-list-item>
    </template>
  </v-select>
</template>

<script setup lang="ts">
import type { TagDto } from '@/backend/printer-tag.service'

defineOptions({
  inheritAttrs: false
})

withDefaults(defineProps<{
  modelValue: number[]
  tags: TagDto[]
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
