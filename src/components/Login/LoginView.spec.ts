import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach } from 'vitest'
import LoginView from '@/components/Login/LoginView.vue' // Adjust the path as necessary
import LoginForm from '@/components/Login/LoginForm.vue'
import Logo from '@/components/Login/Logo.vue'
import { createPinia } from 'pinia'
import { createVuetify } from 'vuetify'
import { createRouter, createWebHistory } from 'vue-router'

const pinia = createPinia()
const vuetify = createVuetify()
// Create a router for testing
const routes = [{ path: '/', component: LoginView }]
const router = createRouter({
  history: createWebHistory(),
  routes
})

describe('LoginView.vue', () => {
  let wrapper: ReturnType<typeof mount>

  beforeEach(() => {
    wrapper = mount(LoginView, {
      global: {
        plugins: [vuetify, pinia, router]
      }
    })
  })

  it('renders the logo component', () => {
    const logo = wrapper.findComponent(Logo)
    expect(logo.exists()).toBe(true)
  })

  it('renders the LoginForm component', () => {
    const loginForm = wrapper.findComponent(LoginForm)
    expect(loginForm.exists()).toBe(true)
  })

  it('displays the correct title', () => {
    const title = wrapper.find('.text-uppercase.text-red') // Using the class selector
    expect(title.exists()).toBe(true) // Check if the title exists
    expect(title.text()).toContain('FDM')
    expect(title.text()).toContain('Monster')
  })

  it('displays the correct subtitle', () => {
    const subtitle = wrapper.find('.v-card-subtitle').text()
    expect(subtitle).toBe('Welcome back! Please enter your details')
  })

  it('renders with the correct structure', () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  it('has the correct CSS class for the login card', () => {
    const loginCard = wrapper.find('.login-card')
    expect(loginCard.exists()).toBe(true)
    expect(loginCard.classes()).toContain('login-card')
    expect(loginCard.attributes('style')).toContain('border-radius: 10px')
  })
})
