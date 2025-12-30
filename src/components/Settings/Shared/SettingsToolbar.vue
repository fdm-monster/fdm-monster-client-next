<template>
  <v-toolbar>
    <v-avatar class="ml-4">
      <v-icon>{{ props.icon }}</v-icon>
    </v-avatar>
    <v-toolbar-title>{{ props.title }}</v-toolbar-title>
    <slot></slot>
  </v-toolbar>
</template>
<script setup lang="ts">
const props = defineProps(["icon", "title"]);
</script>
