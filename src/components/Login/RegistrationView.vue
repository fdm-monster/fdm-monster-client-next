<template>
  <v-row
    class="position-relative"
    no-gutters
  >
    <v-col
      cols="12"
      lg="12"
    >
      <v-container>
        <div
          class="d-flex align-center"
          style="min-height: calc(100vh - 148px)"
        >
          <v-row
            justify="center"
            class="align-content-center"
          >
            <div class="pt-6 pl-6 d-flex flex-column align-center">
              <Logo />

              <v-toolbar-title class="text-uppercase text-red">
                <strong> FDM&nbsp; </strong>
                <strong> Monster </strong>
              </v-toolbar-title>

              <v-toolbar-title class="mt-lg-6 mt-sm-5 mb-md-5">
                Welcome! Please register your account
              </v-toolbar-title>
            </div>

            <v-col
              cols="12"
              md="12"
            >
              <RegistrationForm class="registration-card" />
            </v-col>
          </v-row>
        </div>
      </v-container>
    </v-col>
  </v-row>
</template>

<script lang="ts" setup>
import RegistrationForm from './RegistrationForm.vue'
</script>

<style lang="scss">
.registration-card {
  max-width: 475px;
  margin: 0 auto;
}
</style>
