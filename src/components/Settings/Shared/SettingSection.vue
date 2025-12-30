<template>
  <v-list
    subheader
    three-line
  >
    <v-list-subheader>
      <span class="pr-3">
        {{ props.title }}
      </span>

      <v-tooltip
        bottom
        v-if="props.tooltip?.length"
      >
        <template v-slot:activator="{ props }">
          <v-icon
            class="help-icon"
            v-bind="props"
            >help_outline</v-icon
          >
        </template>
        <span class="tooltip-content">
          {{ tooltip }}
        </span>
      </v-tooltip>
    </v-list-subheader>
    <v-list-item>
      <v-row v-if="usecols">
        <v-col cols="4">
          <slot></slot>
        </v-col>
      </v-row>
      <slot v-else></slot>
    </v-list-item>
  </v-list>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  title: string
  tooltip?: string
  usecols?: boolean
}>(), {
  usecols: true
})
</script>
