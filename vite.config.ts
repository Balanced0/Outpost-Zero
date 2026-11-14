import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fetchLiveDonki } from './src/services/donkiService'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      {
        name: 'donki-dev-server-api',
        configureServer(server) {
          server.middlewares.use('/api/donki', async (req, res) => {
            if (req.method && req.method !== 'GET') {
              res.statusCode = 405
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Method not allowed' }))
              return
            }

            try {
              const apiKey = env.NASA_API_KEY || process.env.NASA_API_KEY
              const payload = await fetchLiveDonki(apiKey)
              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify(payload))
            } catch (err) {
              const message = err instanceof Error ? err.message : String(err)
              res.statusCode = 502
              res.setHeader('Content-Type', 'application/json')
              res.end(
                JSON.stringify({
                  error: 'NASA DONKI request failed',
                  details: message,
                })
              )
            }
          })
        },
      },
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/phaser')) {
              return 'vendor-phaser'
            }
            if (
              id.includes('node_modules/react') ||
              id.includes('node_modules/react-dom') ||
              id.includes('node_modules/scheduler')
            ) {
              return 'vendor-react'
            }
          },
        },
      },
      chunkSizeWarningLimit: 1600,
    },
    server: { port: 5173 },
  }
})
