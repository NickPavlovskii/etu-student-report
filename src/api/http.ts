import axios from 'axios';

const apiBase = import.meta.env.DEV
  ? '/api'
  : (import.meta.env.VITE_API_URL || 'http://localhost:8081/api');

export const http = axios.create({
  baseURL: apiBase,
  headers: { 'Content-Type': 'application/json' },
});

