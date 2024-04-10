<template>
  <v-tooltip :location="props.location">
    <template #activator="{ props: tooltipProps }">
      <v-btn
        v-bind="tooltipProps"
        variant="outlined"
        class="ml-2"
        :color="color"
        @click="$emit('click')"
      >
        <slot>
          <v-icon
            v-if="props.icon?.length"
            :class="'mr-2 ' + props.iconClass"
          >
            {{ props.icon }}
          </v-icon>
          {{ props.text }}
        </slot>
      </v-btn>
    </template>
    <span>
      {{ props.tooltip }}
    </span>
  </v-tooltip>
</template>

<script lang="ts" setup>
defineEmits(['click'])

export interface Props {
  tooltip: string
  color?: string | 'success' | 'warning' | 'danger' | 'primary' | 'secondary'
  icon?: string
  iconClass?: string
  text?: string
  location?: 'start' | 'end' | 'left' | 'right' | 'top' | 'bottom'
}

const props = withDefaults(defineProps<Props>(), {
  color: 'white',
  icon: '',
  iconClass: '',
  text: '',
  location: 'bottom'
})
</script>
