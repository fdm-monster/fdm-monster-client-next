<template>
  <v-img
    :src="imgUrl"
    class="shrink mr-1 pt-3 ml-1"
    contain
    style="opacity: 0.85"
    width="150" />
</template>

<script lang="ts" setup>
import imgUrl from '@/assets/logo.png'
</script>
