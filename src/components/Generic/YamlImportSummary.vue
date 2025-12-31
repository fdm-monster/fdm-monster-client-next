<template>
  <v-card v-if="summary" variant="tonal">
    <v-card-title class="text-h6">
      <v-icon class="mr-2" color="success">check_circle</v-icon>
      Import Summary
    </v-card-title>
    <v-card-text>
      <v-list density="compact">
        <v-list-item>
          <template #prepend>
            <v-icon>info</v-icon>
          </template>
          <v-list-item-title>Version: {{ summary.version }}</v-list-item-title>
        </v-list-item>
        <v-list-item>
          <template #prepend>
            <v-icon>storage</v-icon>
          </template>
          <v-list-item-title>Database: {{ summary.databaseType }}</v-list-item-title>
        </v-list-item>
        <v-list-item>
          <template #prepend>
            <v-icon>schedule</v-icon>
          </template>
          <v-list-item-title>Exported: {{ summary.exportedAt }}</v-list-item-title>
        </v-list-item>
        <v-divider class="my-2" />
        <v-list-item>
          <template #prepend>
            <v-icon>print</v-icon>
          </template>
          <v-list-item-title>{{ summary.printersCount }} Printers</v-list-item-title>
        </v-list-item>
        <v-list-item>
          <template #prepend>
            <v-icon>layers</v-icon>
          </template>
          <v-list-item-title>{{ summary.floorsCount }} Floors</v-list-item-title>
        </v-list-item>
        <v-list-item>
          <template #prepend>
            <v-icon>label</v-icon>
          </template>
          <v-list-item-title>{{ summary.groupsCount }} Tags</v-list-item-title>
        </v-list-item>
        <v-list-item v-if="summary.hasSettings">
          <template #prepend>
            <v-icon :color="excludeSettingsAndUsers ? 'error' : undefined">
              {{ excludeSettingsAndUsers ? 'block' : 'settings' }}
            </v-icon>
          </template>
          <v-list-item-title :class="excludeSettingsAndUsers ? 'text-decoration-line-through text-medium-emphasis' : ''">
            Settings {{ excludeSettingsAndUsers ? '(will be excluded)' : 'included' }}
          </v-list-item-title>
        </v-list-item>
        <v-list-item v-if="summary.usersCount && summary.usersCount > 0">
          <template #prepend>
            <v-icon :color="excludeSettingsAndUsers ? 'error' : undefined">
              {{ excludeSettingsAndUsers ? 'block' : 'people' }}
            </v-icon>
          </template>
          <v-list-item-title :class="excludeSettingsAndUsers ? 'text-decoration-line-through text-medium-emphasis' : ''">
            {{ summary.usersCount }} Users {{ excludeSettingsAndUsers ? '(will be excluded)' : '' }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
export interface YamlImportSummary {
  version: string
  databaseType: string
  exportedAt: string
  printersCount: number
  floorsCount: number
  groupsCount: number
  hasSettings?: boolean
  usersCount?: number
}

interface Props {
  summary: YamlImportSummary | null
  excludeSettingsAndUsers?: boolean
}

withDefaults(defineProps<Props>(), {
  excludeSettingsAndUsers: false
})
</script>
