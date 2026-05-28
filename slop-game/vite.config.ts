import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss()],
  // GitHub Pages serves from /<repo-name>/ — VITE_BASE lets the deploy
  // workflow inject the actual repo name without touching this file.
  base: command === 'build' ? (process.env.VITE_BASE ?? '/slop-game/') : '/',
}))
