import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { existsSync } from 'fs'
const sites = ['hq','yulv','gud','tire','fastclean','da-studio','nodrama','nika','aquacity','chameleon'].filter(s => existsSync(resolve(__dirname, 'src/sites/' + s + '.jsx')))
export default defineConfig({
  plugins: [react()],
  base: '/portfolio/',
  build: {
    outDir: 'dist', emptyOutDir: true, assetsDir: '_s', chunkSizeWarningLimit: 2000,
    rollupOptions: { input: Object.fromEntries(sites.map(s => [s, resolve(__dirname, `${s}/index.html`)])) }
  }
})
