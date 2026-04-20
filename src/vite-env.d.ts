/// <reference types="vite/client" />

import type { DefineComponent } from 'vue'
import type { InfoApi, ServerConfig } from '@/api/types'

declare module '*.vue' {
  const component: DefineComponent<object, object, unknown>
  export default component
}

declare module 'vuetify/styles'

interface ImportMetaEnv {
  /** Версия приложения из `package.json` (подставляется в `vite.config.ts`). */
  readonly VITE_APP_VERSION: string
  /** Полный URL API (часто с суффиксом `/api`, как в локальном fallback). */
  readonly VITE_API_URL?: string
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $infoApi: InfoApi;
    $serverConfig?: ServerConfig;
  }
}

declare module '*.svg?raw' {
  const content: string;
  export default content;
}
