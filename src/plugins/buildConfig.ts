import type { App } from 'vue';
import type { ServerConfig } from '@/api/types';
import { applyServerConfigBaseUrl } from '@/api/axios';

/**
 * После loadServerConfig: применяет URL к axios и кладёт конфиг в $serverConfig.
 * Аналог app.use(buildConfig, server) из Vue CLI-проекта.
 */
export default {
  install(app: App, server?: ServerConfig) {
    if (server) {
      applyServerConfigBaseUrl(server);
      app.config.globalProperties.$serverConfig = server;
    }
  },
};
