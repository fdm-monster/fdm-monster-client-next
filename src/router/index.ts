import { createRouter, createWebHistory } from 'vue-router'
import PrinterGridView from '@/components/PrinterGrid/PrinterGridView.vue'
import PrintersView from '@/components/PrinterList/PrintersView.vue'
import Settings from '@/components/Settings/SettingsView.vue'
import UserManagementSettings from '@/components/Settings/UserManagementSettings.vue'
import PrinterSettings from '@/components/Settings/PrinterSettings.vue'
import FloorSettings from '@/components/Settings/FloorSettings.vue'
import AboutView from '@/components/AboutHelp/AboutView.vue'
import EmergencyCommands from '@/components/Settings/EmergencyCommands.vue'
import NotFoundView from '@/components/NotFound/NotFoundView.vue'
import { useAuthStore } from '@/store/auth.store'
import { RouteNames } from './route-names'
import PermissionDenied from '../components/Login/PermissionDenied.vue'
import LoginView from '../components/Login/LoginView.vue'
import RegistrationView from '../components/Login/RegistrationView.vue'
import CameraGridView from '../components/CameraGrid/CameraGridView.vue'
import FirstTimeSetupView from '../components/FirstTimeSetup/FirstTimeSetupView.vue'
import AccountSettings from '../components/Settings/AccountSettings.vue'
import GridSettings from '../components/Settings/GridSettings.vue'
import ServerProtectionSettings from '../components/Settings/ServerProtectionSettings.vue'
import SoftwareUpgradeSettings from '../components/Settings/SoftwareUpgradeSettings.vue'
import DiagnosticsSettings from '../components/Settings/DiagnosticsSettings.vue'
import PrintJobsView from '../components/PrintJobs/PrintJobsView.vue'
import ExperimentalSettings from '@/components/Settings/ExperimentalSettings.vue'
import DebugSocketSettings from "@/components/Settings/DebugSocketSettings.vue";

const NeedsAuth = {
  requiresAuth: true
}

const NoAuth = {
  requiresAuth: false
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: RouteNames.Home,
      meta: NeedsAuth,
      component: PrinterGridView
    },
    {
      path: '/first-time-setup',
      name: RouteNames.FirstTimeSetup,
      meta: NoAuth,
      component: FirstTimeSetupView
    },
    {
      path: '/login',
      name: RouteNames.Login,
      meta: NoAuth,
      component: LoginView
    },
    {
      path: '/registration',
      name: RouteNames.Registration,
      meta: NoAuth,
      component: RegistrationView
    },
    {
      path: '/printers',
      name: RouteNames.PrintersView,
      meta: NeedsAuth,
      component: PrintersView
    },
    {
      path: '/cameras',
      name: RouteNames.CameraGridView,
      meta: NeedsAuth,
      component: CameraGridView
    },
    {
      path: '/settings',
      component: Settings,
      meta: NeedsAuth,
      children: [
        {
          path: '',
          meta: NeedsAuth,
          redirect: '/settings/grid'
        },
        {
          path: 'account',
          meta: NeedsAuth,
          component: AccountSettings
        },
        {
          path: 'server-protection',
          meta: NeedsAuth,
          component: ServerProtectionSettings
        },
        {
          path: 'grid',
          meta: NeedsAuth,
          component: GridSettings
        },
        {
          path: 'floors',
          meta: NeedsAuth,
          component: FloorSettings
        },
        {
          path: 'user-management',
          meta: NeedsAuth,
          component: UserManagementSettings
        },
        {
          path: 'printer',
          meta: NeedsAuth,
          component: PrinterSettings
        },
        {
          path: 'emergency-commands',
          meta: NeedsAuth,
          component: EmergencyCommands
        },
        {
          path: 'software-upgrade',
          meta: NeedsAuth,
          component: SoftwareUpgradeSettings
        },
        {
          path: 'diagnostics',
          meta: NeedsAuth,
          component: DiagnosticsSettings
        },
        {
          path: 'experimental',
          meta: NeedsAuth,
          component: ExperimentalSettings
        },
        {
          path: "debug-socket",
          meta: NeedsAuth,
          component: DebugSocketSettings,
        }
      ]
    },
    {
      path: '/jobs',
      name: RouteNames.PrintJobs,
      meta: NeedsAuth,
      component: PrintJobsView
    },
    {
      path: '/about',
      name: 'About',
      component: AboutView
    },
    {
      path: '/permission-denied',
      name: RouteNames.PermissionDenied,
      meta: NeedsAuth,
      component: PermissionDenied
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: NotFoundView
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  // This prevents login page from being shown when already logged in
  const authStore = useAuthStore()

  // Note that we do not let loginRequired === null coerce to false as that means its not loaded
  if (!to?.meta?.requiresAuth || authStore.loginRequired === false) {
    console.debug(`No auth required on route ${to.fullPath}`)
    return next()
  }
  // TODO why is this here again? This causes the app not to initialize properly (SocketIO/settings in AppLoader)
  // else if (authStore.loginRequired === null) {
  //   return next();
  // }
  else {
    console.debug(
      `Auth required on route ${to.fullPath} (loginRequired=${authStore.loginRequired}, registration=${authStore.registration}, wizardState=${authStore.wizardState}, requiresAuth=${to?.meta?.requiresAuth})`
    )
  }

  authStore.loadTokens()
  if (!authStore.hasAuthToken && !authStore.hasRefreshToken) {
    console.debug('Not logged in, redirecting to login page')
    if (from.path == '/login') {
      throw new Error('Already on login page, cannot redirect')
    }
    return next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  }

  return next()
})

export default router
