import type { ServerConfig } from './types';

export type { ServerConfig } from './types';

export function getFallbackServerConfig(): ServerConfig {
  if (import.meta.env.DEV) {
    const url = '/api'
    return {
      api: {
        services: {
          baseUrl: url,
          infoUrl: url,
        },
      },
    }
  }
  return {
    api: {
      services: {
        baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8081/api',
        infoUrl: import.meta.env.VITE_API_URL || 'http://localhost:8081/api',
      },
    },
  }
}

export async function loadServerConfig(): Promise<ServerConfig> {
  let serverConfig: ServerConfig | null = null
  try {
    const res = await fetch('/server/config.json')
    if (!res.ok) {
      return getFallbackServerConfig()
    }
    const text = await res.text()
    const start = text.trimStart()
    if (!start.startsWith('{') && !start.startsWith('[')) {
      return getFallbackServerConfig()
    }
    serverConfig = JSON.parse(text) as ServerConfig
  } catch (error) {
    console.warn('[loadServerConfig] не удалось прочитать /server/config.json:', error)
  }
  return serverConfig ?? getFallbackServerConfig()
}
