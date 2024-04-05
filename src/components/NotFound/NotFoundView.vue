<template>
  <v-container>
    <h2 class="text-center mt-lg-12">This page was not found.</h2>

    <h1 class="text-center">: (</h1>
    <br/>
    <h4 class="text-center">
      <v-btn class="align-center" color="primary" to="/" variant="elevated">
        <v-icon class="mr-2">home</v-icon>
        Go home
      </v-btn>

      <span class="pa-5">or</span>
      <v-btn class="align-center" variant="elevated" @click="goBack()">
        <v-icon class="mr-2">arrow_left</v-icon>
        Go back
      </v-btn>
    </h4>
  </v-container>
</template>

<script lang="ts" setup>
import {useRouter} from "vue-router"

const router = useRouter()

const goBack = () => {
  router.go(-1)
}
</script>
