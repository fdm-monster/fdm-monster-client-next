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
            :style="item.divider ? 'border-bottom: 1px solid gray' : ''"
          />
        </v-list>
      </v-navigation-drawer>
    </div>

    <router-view />
  </v-row>
</template>

<script lang="ts" setup>
const items = ref([
  {
    title: 'Grid',
    icon: 'grid_on',
    path: '/settings/grid',
    divider: false
  },
  {
    title: 'Floors',
    icon: 'house_siding',
    path: '/settings/floors',
    divider: true
  },
  {
    title: 'OctoPrint',
    icon: 'image',
    path: '/settings/octoprint',
    divider: false
  },

  {
    title: 'Emergency Commands',
    icon: 'warning',
    path: '/settings/emergency-commands',
    divider: true
  },
  {
    title: 'Users',
    icon: 'group',
    path: '/settings/user-management',
    divider: false
  },
  {
    title: 'Account',
    icon: 'account_circle',
    path: '/settings/account',
    divider: false
  },
  {
    title: 'Server Protection',
    icon: 'security',
    path: '/settings/server-protection',
    divider: true
  },
  {
    title: 'Software Upgrade',
    icon: 'upgrade',
    path: '/settings/software-upgrade',
    divider: false
  },
  {
    title: 'Diagnostics',
    icon: 'bug_report',
    path: '/settings/diagnostics',
    divider: false
  },
  {
    title: 'Experimental',
    icon: 'settings_applications',
    path: '/settings/experimental',
    divider: false
  }
])
</script>
