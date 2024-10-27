import { Router } from 'vue-router'
import { RouteNames } from './route-names'

export async function routeToPath(router: Router, name: string) {
  return router.push({ name })
}

export async function routeToLogin(router: Router) {
  // Prevent redundant or circular routing
  if (router.currentRoute.value.path === '/login') {
    console.log('routeToLogin: already at login page')
    return
  }
  return routeToPath(router, RouteNames.Login)
}

export async function routeToHome(router: Router) {
  // Prevent redundant or circular routing
  if (router.currentRoute.value.path === '/') {
    return
  }
  return routeToPath(router, RouteNames.Home)
}
