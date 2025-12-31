<template>
  <v-card>
    <v-card-title>About FDM Monster</v-card-title>
    <v-card-text>
      <p>
        FDM Monster is an open-source 3D printing farm management system created
        by David Zwart in 2021.
      </p>
      <p class="mt-4">
        <strong>Server version:</strong> {{ serverVersion }}<br />
        <strong>Client version:</strong> {{ version }}<br />
        <strong v-if="monsterPiVersion">MonsterPi version: {{ monsterPiVersion }}</strong>
        <strong v-else>No MonsterPi distro detected.</strong>
      </p>
      <v-btn
        class="mt-3"
        variant="outlined"
        to="/settings/software-upgrade"
      >
        <v-icon>mdi:mdi-upgrade</v-icon>
        Visit Upgrade Settings
      </v-btn>
    </v-card-text>

    <v-card-title>Documentation & Support</v-card-title>
    <v-card-text>
      <v-btn
        href="https://docs.fdm-monster.net"
        target="_blank"
        variant="tonal"
        class="mb-2"
      >
        <v-icon class="mr-2">menu_book</v-icon>
        Documentation
      </v-btn>
      <br />

      <v-btn
        href="https://discord.gg/mwA8uP8CMc"
        target="_blank"
        color="indigo"
        variant="elevated"
        class="mb-2"
      >
        <v-icon class="mr-2">discord</v-icon>
        Join our Discord
      </v-btn>

      <br />
      <v-btn
        href="https://github.com/fdm-monster/fdm-monster/issues"
        variant="tonal"
        target="_blank"
      >
        <v-icon class="mr-2">mdi:mdi-github</v-icon>
        Report Issue on GitHub
      </v-btn>
    </v-card-text>

    <v-card-title>Author</v-card-title>
    <v-card-text>
      <div class="d-flex align-center">
        <img
          src="/img/DavidZwart.jpg"
          width="100"
          class="mr-4"
          alt="Creator David Zwart"
        />
        <div>
          <div class="mb-2">David Zwart MSc.</div>
          <div class="d-flex gap-2">
            <v-btn
              icon
              size="small"
              variant="tonal"
              class="mr-2"
              href="https://www.linkedin.com/in/david-zwart-88514083/"
              target="_blank"
            >
              <v-icon>mdi:mdi-linkedin</v-icon>
            </v-btn>
            <v-btn
              icon
              size="small"
              variant="tonal"
              href="https://github.com/davidzwa"
              target="_blank"
            >
              <v-icon>mdi:mdi-github</v-icon>
            </v-btn>
          </div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { AppService } from '@/backend/app.service'
import { version as clientVersion } from '../../../package.json'

const serverVersion = ref('')
const monsterPiVersion = ref<string | null>('')
const version = ref(clientVersion)

onMounted(async () => {
  const versionSpec = await AppService.getVersion()
  serverVersion.value = versionSpec.version
  monsterPiVersion.value = versionSpec.monsterPi
})
</script>
