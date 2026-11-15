import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const LOCAL_API = 'http://127.0.0.1:8001'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': LOCAL_API,
      '/sanctum': LOCAL_API,
    },
  },
})
