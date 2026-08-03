import { defineConfig } from 'astro/config'
import yaml from '@rollup/plugin-yaml'

export default defineConfig({
  site: 'https://ugurkc.github.io',
  vite: {
    plugins: [yaml()],
  },
})
