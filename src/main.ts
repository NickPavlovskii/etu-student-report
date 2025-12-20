import { createApp } from 'vue'
import App from './App.vue'

import router from './router'

// ================= Vuetify =================
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// ================= Element Plus =================
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// ================= Icons =================
import '@mdi/font/css/materialdesignicons.css'

import GlobalComponents from '../src/components/global/index'

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
  },
})

createApp(App)
  .use(router)
  .use(vuetify)
  .use(ElementPlus)
  .use(GlobalComponents)
  .mount('#app')
