/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 * Note to self: src/styles/vuetify-variables.d.css contains a subset of CSS variables.
 */

import 'material-design-icons-iconfont/dist/material-design-icons.css'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { aliases, md } from 'vuetify/iconsets/md'
import { mdi } from "vuetify/iconsets/mdi";
import { createVuetify } from 'vuetify'
import { VStepperVertical, VStepperVerticalItem } from "vuetify/labs/components";

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export const vuetify = createVuetify({
  theme: {
    defaultTheme: 'dark',
    themes: {
      dark: {
        dark: true,
        colors: {
          primary: '#1eb6c3',
          secondary: '#424242',
          accent: '#82B1FF',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FFC107'
        }
      },
      light: {
        dark: false,
        colors: {
          primary: '#1eb6c3',
          secondary: '#424242',
          accent: '#82B1FF',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FFC107'
        }
      }
    }
  },
  icons: {
    defaultSet: 'md',
    aliases,
    sets: {
      md,
      mdi,
    }
  },
  components: {
    VStepperVertical,
    VStepperVerticalItem
  }
})
