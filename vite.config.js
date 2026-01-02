import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  if (!env.VITE_MATTIN_URL) {
    console.warn("WARNING: VITE_MATTIN_URL is not defined in .env. Proxy may not work.");
  }

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/public': {
          target: env.VITE_MATTIN_URL,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
