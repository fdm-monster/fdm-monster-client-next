<template>
  <v-card>
    <v-card-text>
      <GridLoader
        v-if="loading"
        :size="20"
        color="#a70015"
        style="margin: 250px; position: absolute"
      />

      <SettingSection title="User Management" :usecols="false">
        <div class="mb-4">
          <v-btn
            :disabled="!profile?.isRootUser"
            color="primary"
            prepend-icon="add"
            @click="openCreateUserDialog()"
          >
            Create Verified User
          </v-btn>
        </div>

        <v-table theme="dark" hover>
          <thead>
            <tr>
              <th scope="col" class="text-left">Username</th>
              <th scope="col" class="text-left">Status</th>
              <th scope="col" class="text-left">Roles</th>
              <th scope="col" class="text-left">Created</th>
              <th scope="col" class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(user, index) in users"
              :key="index"
              :class="{ 'bg-grey-darken-3': isCurrentAccount(user) }"
            >
              <td>
                <div class="d-flex align-center">
                  <span class="font-weight-medium">{{ user.username }}</span>
                  <v-chip
                    v-if="isCurrentAccount(user)"
                    color="primary"
                    size="x-small"
                    class="ml-2"
                  >
                    You
                  </v-chip>
                </div>
              </td>
              <td>
                <div class="d-flex align-center ga-1">
                  <v-chip
                    :color="user.isVerified ? 'success' : 'warning'"
                    size="x-small"
                  >
                    {{ user.isVerified ? 'Verified' : 'Unverified' }}
                  </v-chip>
                  <v-chip
                    v-if="user.isDemoUser"
                    size="x-small"
                    color="info"
                  >
                    Demo
                  </v-chip>
                </div>
              </td>
              <td>
                <div v-if="profile?.isRootUser" style="min-width: 200px">
                  <v-select
                    :items="roles.map((r) => ({ title: r.name, value: r.name }))"
                    v-model="user.roles"
                    multiple
                    chips
                    density="compact"
                    variant="outlined"
                    hide-details
                    @update:model-value="updateUserRoles(user)"
                  >
                    <template v-slot:prepend-item v-if="user.isRootUser">
                      <v-list-item>
                        <v-chip size="small" color="error">OWNER</v-chip>
                      </v-list-item>
                      <v-divider />
                    </template>
                  </v-select>
                </div>
                <div v-else class="d-flex align-center ga-1 flex-wrap">
                  <v-chip
                    v-if="user.isRootUser"
                    size="x-small"
                    color="error"
                  >
                    OWNER
                  </v-chip>
                  <v-chip
                    v-for="role of user.roles"
                    :key="role"
                    size="x-small"
                  >
                    {{ role }}
                  </v-chip>
                </div>
              </td>
              <td class="text-caption">
                {{ formatIntlDate(user.createdAt) }}
              </td>
              <td>
                <div class="d-flex justify-end ga-1">
                  <v-tooltip :text="user.isVerified ? 'Set user to unverified' : 'Set user to verified'">
                    <template v-slot:activator="{ props }">
                      <v-btn
                        v-bind="props"
                        :disabled="isCurrentAccount(user) || user.isRootUser"
                        :color="user.isVerified ? 'warning' : 'success'"
                        size="small"
                        icon
                        variant="text"
                        @click="verifyUser(user, !user.isVerified)"
                      >
                        <v-icon>{{ user.isVerified ? 'shield_off' : 'shield' }}</v-icon>
                      </v-btn>
                    </template>
                  </v-tooltip>

                  <v-tooltip text="Toggle owner status">
                    <template v-slot:activator="{ props }">
                      <v-btn
                        v-bind="props"
                        :disabled="isCurrentAccount(user) || !profile?.isRootUser"
                        :color="user.isRootUser ? 'warning' : 'primary'"
                        size="small"
                        icon
                        variant="text"
                        @click="setRootUser(user, !user.isRootUser)"
                      >
                        <v-icon>{{ user.isRootUser ? 'key_off' : 'key' }}</v-icon>
                      </v-btn>
                    </template>
                  </v-tooltip>

                  <v-tooltip text="Delete user">
                    <template v-slot:activator="{ props }">
                      <v-btn
                        v-bind="props"
                        :disabled="isCurrentAccount(user) || user.isRootUser"
                        color="error"
                        size="small"
                        icon
                        variant="text"
                        @click="deleteUser(user)"
                      >
                        <v-icon>delete</v-icon>
                      </v-btn>
                    </template>
                  </v-tooltip>
                </div>
              </td>
            </tr>
          </tbody>
        </v-table>
      </SettingSection>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { UserService } from '@/backend/user.service'
import { Role, User } from '@/models/user.model'
import { formatIntlDate } from '@/utils/date.utils'
import GridLoader from '@/components/Generic/Loaders/GridLoader.vue'
import { useQuery } from '@tanstack/vue-query'
import { useSnackbar } from '@/shared/snackbar.composable'
import { useDialog } from '@/shared/dialog.composable'
import { DialogName } from '@/components/Generic/Dialogs/dialog.constants'
import SettingSection from '@/components/Settings/Shared/SettingSection.vue'

const snackbar = useSnackbar()
const loading = ref<boolean>(false)
const profile = ref<User>()
const users = ref<User[]>([])
const roles = ref<Role[]>([])

async function loadData() {
  loading.value = true
  try {
    profile.value = await UserService.getProfile()
    roles.value = await UserService.listRoles()
    users.value = await UserService.listUsers()
  } catch (e) {
    loading.value = false
    console.error(e)
    throw e
  }

  loading.value = false

  return {
    users,
    roles,
    profile
  }
}

const userQuery = useQuery({
  queryKey: ['userRolesProfile'],
  queryFn: loadData
})

function isCurrentAccount(user: User): boolean {
  return user.id == profile.value?.id
}

async function deleteUser(user: User) {
  if (!confirm(`Are you sure you want to delete ${user.username}?`)) {
    return
  }

  try {
    loading.value = true
    await UserService.deleteUser(user.id)
    await userQuery.refetch()
  } catch (e) {
    loading.value = false
    console.error(e)
    throw e
  }
  loading.value = false

  snackbar.info(`User ${user.username} deleted`)
}

async function verifyUser(user: User, isVerified: boolean = true) {
  if (user.isRootUser) {
    snackbar.error('You are not allowed to do perform this action on an owner')
    return
  }
  if (
    !confirm(
      `Are you sure you want to ${isVerified ? 'verify' : 'unverify'} ${
        user.username
      }?`
    )
  ) {
    return
  }

  try {
    loading.value = true
    await UserService.setUserVerified(user.id, isVerified)
    await userQuery.refetch()
  } catch (e) {
    loading.value = false
    console.error(e)
    throw e
  }
  loading.value = false

  snackbar.info(
    isVerified
      ? `User ${user.username} verified`
      : `User ${user.username} unverified`
  )
}

async function setRootUser(user: User, isRootUser: boolean = true) {
  if (!profile.value?.isRootUser) {
    snackbar.error(
      "You are not allowed to do perform this action as you're not an owner"
    )
  }

  if (
    !confirm(
      `You are about to ${isRootUser ? 'set' : 'remove'} owner rights on ${
        user.username
      }. Are you sure?`
    )
  ) {
    return
  }

  try {
    loading.value = true
    await UserService.setRootUser(user.id, isRootUser)
    await userQuery.refetch()
  } catch (e) {
    loading.value = false
    console.error(e)
    throw e
  }
  loading.value = false

  snackbar.info(
    isRootUser
      ? `User ${user.username} set to owner`
      : `User ${user.username} is no longer owner`
  )
}

// Define the new function to update user roles
async function updateUserRoles(user: User) {
  try {
    loading.value = true
    await UserService.setUserRoles(user.id, user.roles)
    await userQuery.refetch()
    snackbar.info(`Roles updated for ${user.username}`)
  } catch (e) {
    loading.value = false
    console.error(e)
    snackbar.error(`Failed to update roles for ${user.username}`)
    throw e
  }
  loading.value = false
}

async function openCreateUserDialog() {
  await useDialog(DialogName.CreateUserDialog).openDialog()
}
</script>
