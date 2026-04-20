import type { ServerConfig } from './types';

export type { ServerConfig } from './types';

/** Полный URL бэкенда из сборки (без обрезки в UI хостинга). Пробелы и хвостовой `/` убираются. */
export function normalizeViteApiUrl(): string | undefined {
  const raw = import.meta.env.VITE_API_URL
  if (typeof raw !== 'string') return undefined
  const t = raw.trim()
  if (!t) return undefined
  return t.replace(/\/+$/, '')
}

export function resolveApiBaseUrlFromVite(): string | undefined {
  const origin = normalizeViteApiUrl()
  if (!origin) return undefined
  return origin.replace(/\/+$/, '').endsWith('/api')
    ? origin.replace(/\/+$/, '')
    : `${origin.replace(/\/+$/, '')}/api`
}

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
  const vite = resolveApiBaseUrlFromVite()
  const fallback = vite ?? 'http://localhost:8081/api'
  return {
    api: {
      services: {
        baseUrl: fallback,
        infoUrl: fallback,
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
