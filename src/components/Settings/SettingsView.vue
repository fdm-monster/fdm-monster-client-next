<template>
  <v-row no-gutters>
    <div>
      <v-navigation-drawer :permanent="true">
        <v-list-item>
          <v-list-item-title class="text-h6"> Settings </v-list-item-title>
          <v-list-item-subtitle> Adjust your Fdm Monster </v-list-item-subtitle>
        </v-list-item>

        <v-divider />

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
          />
        </v-list>
      </v-navigation-drawer>
    </div>

    <router-view class="grow" />
  </v-row>
</template>

<script lang="ts" setup>
const items = ref([
  {
    title: 'Grid',
    icon: 'grid_on',
    path: '/settings/grid'
  },
  {
    title: 'Floors',
    icon: 'house_siding',
    path: '/settings/floors'
  },
  {
    title: 'User Management',
    icon: 'group',
    path: '/settings/user-management'
  },
  {
    title: 'Account Settings',
    icon: 'account_circle',
    path: '/settings/account'
  },
  {
    title: 'Server Protection',
    icon: 'security',
    path: '/settings/server-protection'
  },
  { title: 'OctoPrint Settings', icon: 'image', path: '/settings/octoprint' },
  {
    title: 'Emergency Commands',
    icon: 'warning',
    path: '/settings/emergency-commands'
  },
  {
    title: 'Software Upgrade',
    icon: 'upgrade',
    path: '/settings/software-upgrade'
  },
  { title: 'Diagnostics', icon: 'bug_report', path: '/settings/diagnostics' },
  {
    title: 'Experimental',
    icon: 'settings_applications',
    path: '/settings/experimental',
    divider: false
  }
])
</script>
