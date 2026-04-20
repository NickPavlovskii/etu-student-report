import axios from 'axios';
import type { ServerConfig } from './utils';
import { getFallbackServerConfig, normalizeViteApiUrl } from './utils';

axios.defaults.headers.accept = 'application/json';

function resolveInitialBases(): { baseUrl: string; infoUrl: string } {
  const fb = getFallbackServerConfig();
  const s = fb.api?.services;
  const fallback = s?.infoUrl ?? s?.baseUrl ?? '/api';
  return {
    baseUrl: s?.baseUrl ?? s?.infoUrl ?? fallback,
    infoUrl: s?.infoUrl ?? s?.baseUrl ?? fallback,
  };
}

const { baseUrl: initialBaseUrl, infoUrl: initialInfoUrl } = resolveInitialBases();

export const baseAxios = axios.create({
  baseURL: initialBaseUrl,
  headers: { 'Content-Type': 'application/json' },
});

export const infoAxios = axios.create({
  baseURL: initialInfoUrl,
  headers: { 'Content-Type': 'application/json' },
});

export function applyServerConfigBaseUrl(config: ServerConfig): void {
  const fb = getFallbackServerConfig();
  const fbS = fb.api?.services;
  const fallbackInfo = fbS?.infoUrl ?? fbS?.baseUrl ?? '/api';
  const fallbackBase = fbS?.baseUrl ?? fbS?.infoUrl ?? fallbackInfo;

  // В dev всегда относительный /api → Vite proxy на бэкенд (без CORS и без «битых» IP из config.json).
  if (import.meta.env.DEV) {
    baseAxios.defaults.baseURL = fallbackBase;
    infoAxios.defaults.baseURL = fallbackInfo;
    return;
  }

  const s = config.api?.services;
  let infoUrl = s?.infoUrl ?? s?.baseUrl ?? fallbackInfo;
  let baseUrl = s?.baseUrl ?? s?.infoUrl ?? fallbackBase;

  const viteBase = normalizeViteApiUrl();
  if (viteBase) {
    baseUrl = viteBase;
    infoUrl = viteBase;
  }

  baseAxios.defaults.baseURL = baseUrl;
  infoAxios.defaults.baseURL = infoUrl;
}
