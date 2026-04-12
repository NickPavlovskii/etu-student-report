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

import infoApiPlugin from './api/info'
import { loadServerConfig } from './api/utils'
import buildConfig from './plugins/buildConfig'

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

const app = createApp(App)

app.use(router)
app.use(vuetify)
app.use(ElementPlus)
app.use(GlobalComponents)
app.use(infoApiPlugin)

loadServerConfig()
  .then((server) => {
    app.use(buildConfig, server)
    app.mount('#app')
  })
  .catch((e: unknown) => {
    console.error(e instanceof Error ? e.message : e)
  })
