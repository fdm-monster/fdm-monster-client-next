<template>
  <v-row class="position-relative" no-gutters>
    <v-col cols="12" lg="12">
      <v-container>
        <div class="d-flex align-center" style="min-height: calc(100vh - 148px)">
          <v-row justify="center" class="align-content-center">
            <div class="pt-6 pl-6 d-flex flex-column align-center">
              <Logo/>

              <v-toolbar-title class="text-uppercase text-red">
                <strong>FDM&nbsp;</strong>
                <strong>Monster</strong>
              </v-toolbar-title>

              <v-toolbar-title class="mt-lg-6 mt-sm-5 mb-md-5"> Login to your account</v-toolbar-title>

              <v-card-subtitle class="text-grey mb-md-5">
                Welcome back! Please enter your details
              </v-card-subtitle>
            </div>

            <v-col cols="12" md="12">
              <LoginForm class="login-card"/>
            </v-col>
          </v-row>
        </div>
      </v-container>
    </v-col>
  </v-row>
</template>

<script lang="ts" setup>
import LoginForm from "./LoginForm.vue"
</script>

<style lang="scss">
.login-card {
  max-width: 475px;
  margin: 0 auto;
}

.blur-logo {
  position: absolute;
  filter: blur(18px);
  bottom: 0;
  transform: inherit;
}
</style>
