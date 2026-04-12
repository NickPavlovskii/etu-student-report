/// <reference types="vite/client" />

import type { InfoApi, ServerConfig } from '@/api/types'

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
