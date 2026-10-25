import { URL } from 'node:url'
import console from 'node:console'
import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { chromium } from '@playwright/test'

const extension = resolve('dist-chrome')
const context = await chromium.launchPersistentContext('', {
  channel: 'chromium',
  headless: true,
  viewport: { width: 1280, height: 800 },
  args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`]
})
try {
  const worker = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker'))
  const page = await context.newPage()
  await page.goto(`chrome-extension://${new URL(worker.url()).host}/browseraction.html`)
  await page
    .locator('#urls')
    .fill(
      'https://developer.chrome.com/docs/extensions\nhttps://vuejs.org/guide/\nhttps://vite.dev/guide/\nhttps://github.com/jansel/Open-Multiple-URLs'
    )
  await page.locator('#deduplicate').check()
  await page.locator('#urls').blur()
  await mkdir('docs/store', { recursive: true })
  for (const colorScheme of ['light', 'dark']) {
    await page.emulateMedia({ colorScheme })
    await page.screenshot({ path: `docs/store/screenshot-${colorScheme}.png` })
  }
  console.log('Saved 1280 × 800 store screenshots in docs/store.')
} finally {
  await context.close()
}
