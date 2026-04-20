/// <reference types="vite/client" />

import type { InfoApi, ServerConfig } from '@/api/types'

interface ImportMetaEnv {
  /** Версия приложения из `package.json` (подставляется в `vite.config.ts`). */
  readonly VITE_APP_VERSION: string
  /**
   * Origin бэкенда, например `https://etu-reports-backend-1.onrender.com`.
   * Префикс `/api` для axios добавляется в `resolveApiBaseUrlFromVite()`;
   * можно сразу указать полный базис с `/api` — тогда дублирования не будет.
   */
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
