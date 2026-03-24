import { createApp } from 'vue'
import App from './App.vue'

import router from './router'
import './scss/main.scss';

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

import GlobalComponents from './components/global/index'
import { ru } from 'vuetify/locale'

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
  },
  locale: {
    locale: 'ru',
    fallback: 'en',
    messages: { ru },
  },
})

createApp(App)
  .use(router)
  .use(vuetify)
  .use(ElementPlus)
  .use(GlobalComponents)
  .mount('#app')
