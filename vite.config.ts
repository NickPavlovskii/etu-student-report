import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import fs from 'node:fs'
import type { Plugin } from 'vite'

const OUT_DIR = 'dist/frontend/contents/panda/client'

const pkgPath = path.join(path.resolve(__dirname), 'package.json')
const appVersion = JSON.parse(fs.readFileSync(pkgPath, 'utf-8')) as {
  version: string
}

function serverProductsCopyPlugin(): Plugin {
  const root = path.resolve(__dirname)
  const productsServer = path.join(root, 'products', 'server')

  return {
    name: 'server-products-copy',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0]
        if (url === '/server/config.json') {
          const file = path.join(productsServer, 'config.json')
          if (fs.existsSync(file)) {
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            fs.createReadStream(file).pipe(res)
            return
          }
        }
        next()
      })
    },
    closeBundle() {
      if (!fs.existsSync(productsServer)) return
      const dest = path.join(root, OUT_DIR, 'server')
      fs.mkdirSync(dest, { recursive: true })
      for (const name of fs.readdirSync(productsServer)) {
        const from = path.join(productsServer, name)
        const to = path.join(dest, name)
        if (fs.statSync(from).isDirectory()) continue
        fs.copyFileSync(from, to)
      }
    },
  }
}

export default defineConfig({
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(appVersion.version),
  },
  plugins: [vue(), serverProductsCopyPlugin()],
  build: {
    outDir: OUT_DIR,
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
})
