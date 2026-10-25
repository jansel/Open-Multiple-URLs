import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import packageJson from './package.json' with { type: 'json' }

export default defineConfig(() => {
  const target = 'chrome'
  return {
    plugins: [
      vue(),
      {
        name: 'extension-assets',
        generateBundle() {
          this.emitFile({
            type: 'asset',
            fileName: 'manifest.json',
            source: readFileSync(`src/manifest/${target}/manifest.json`, 'utf8').replace(
              '__VERSION__',
              packageJson.version
            )
          })
          for (const fileName of readdirSync('src/icons')) {
            this.emitFile({
              type: 'asset',
              fileName,
              source: readFileSync(`src/icons/${fileName}`)
            })
          }
        }
      }
    ],
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
    build: {
      outDir: `dist-${target}`,
      rolldownOptions: {
        input: {
          BrowserAction: './browseraction.html',
          LazyLoading: './lazyloading.html',
          background: './src/serviceworker/background.ts'
        },
        output: {
          entryFileNames: (chunk) =>
            chunk.name === 'background' ? 'background.js' : 'assets/[name]-[hash].js'
        }
      }
    }
  }
})
