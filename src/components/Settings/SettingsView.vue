<template>
  <div>
    <v-row no-gutters>
      <v-navigation-drawer :permanent="true">
        <v-list
          density="compact"
          nav
        >
          <v-list-item
            v-for="item in items"
            :key="item.title"
            :to="item.path"
            link
            :prepend-icon="item.icon"
            :title="item.title"
            router-link
            :style="item.divider ? 'border-bottom: 1px solid gray' : ''"
          />
        </v-list>
      </v-navigation-drawer>

      <v-col>
        <router-view />
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts" setup>
import { settingsPage } from '@/router/setting.constants'

const items = ref(settingsPage)
</script>
