import { test, expect, chromium } from '@playwright/test'
import { resolve } from 'node:path'

test('built extension extracts text and opens tabs in Chromium', async () => {
  const extensionPath = resolve('dist-chrome')
  // An empty userDataDir gives every run a fresh, temporary profile.
  const context = await chromium.launchPersistentContext('', {
    channel: 'chromium',
    headless: !process.env.HEADED,
    args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`]
  })
  try {
    const worker = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker'))
    const extensionId = new URL(worker.url()).host
    const page = await context.newPage()
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.goto(`chrome-extension://${extensionId}/browseraction.html`)
    await page.locator('#urls').fill('Visit https://example.com and https://example.org today.')
    await page.locator('#extract').click()
    await expect(page.locator('#urls')).toHaveValue('https://example.com\nhttps://example.org\n')
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await page.evaluate(() =>
      navigator.clipboard.writeText('Links: https://example.net and https://example.edu.')
    )
    await page.locator('#urls').press('ControlOrMeta+A')
    await page.locator('#urls').press('ControlOrMeta+V')
    await expect(page.locator('#urls')).toHaveValue('https://example.net\nhttps://example.edu\n')
    await page.evaluate(() => navigator.clipboard.writeText('a note with https://example.test'))
    await page.locator('#urls').press('ArrowRight')
    await page.locator('#urls').press('ControlOrMeta+End')
    await page.locator('#urls').press('ControlOrMeta+V')
    await expect(page.locator('#urls')).toHaveValue(
      'https://example.net\nhttps://example.edu\na note with https://example.test'
    )
    await page.locator('#urls').fill('https://example.com\nhttps://example.org')
    await page.locator('#lazyLoad').check()
    await page.locator('#open').click()
    await expect
      .poll(() => context.pages().filter((tab) => tab.url().includes('/lazyloading.html#')).length)
      .toBe(2)
    expect(errors).toEqual([])
  } finally {
    await context.close()
  }
})
