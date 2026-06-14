import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/analyze': 'http://localhost:8000',
      '/examples': 'http://localhost:8000',
      '/english_equivalent': 'http://localhost:8000',
      '/chat': 'http://localhost:8000',
    },
  },
})
