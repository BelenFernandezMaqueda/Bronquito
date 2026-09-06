import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // host 0.0.0.0 para que el servidor sea accesible desde fuera del
    // contenedor Docker (localhost del contenedor != localhost de tu máquina).
    host: true,
    port: 5173,
  },
})
