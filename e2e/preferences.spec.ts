import { createServer } from 'node:http'
import type { AddressInfo } from 'node:net'
import { test, expect } from './fixtures'

test('keeps options and input local with the new defaults', async ({
  workspace,
  extensionContext
}) => {
  const worker = extensionContext.serviceWorkers()[0]
  expect(await worker.evaluate('chrome.runtime.getManifest().permissions')).toEqual([
    'storage',
    'tabGroups'
  ])
  await expect(workspace.locator('#searchquery')).toHaveCount(0)
  await expect(workspace.locator('#preserve')).toBeChecked()
  await expect(workspace.locator('#deduplicate')).toBeChecked()
  await expect(workspace.getByLabel('Order', { exact: true })).toHaveValue('original')
  await workspace.locator('#urls').fill('https://example.com/local-only')
  await workspace.locator('#lazyLoad').check()
  await workspace.getByLabel('Order', { exact: true }).selectOption('random')
  await workspace.getByLabel('Order', { exact: true }).selectOption('reverse')
  await workspace.locator('#tabGroupSelection').selectOption('-2')
  await expect
    .poll(() => worker.evaluate('chrome.storage.local.get(null)'))
    .toEqual({
      txt: 'https://example.com/local-only',
      lazyload: true,
      order: 'reverse',
      selectedTabGroupId: -2
    })
  await workspace.reload()
  await expect(workspace.locator('#urls')).toHaveValue('https://example.com/local-only')
  await expect(workspace.locator('#lazyLoad')).toBeChecked()
  await expect(workspace.getByLabel('Order', { exact: true })).toHaveValue('reverse')
  await expect(workspace.locator('#tabGroupSelection')).toHaveValue('-2')
  await workspace.locator('#deduplicate').uncheck()
  await workspace.locator('#preserve').uncheck()
  await expect
    .poll(() => worker.evaluate('chrome.storage.local.get(["preserve", "deduplicate", "txt"])'))
    .toEqual({ preserve: false, deduplicate: false, txt: '' })
  await workspace.reload()
  await expect(workspace.locator('#preserve')).not.toBeChecked()
  await expect(workspace.locator('#deduplicate')).not.toBeChecked()
  await expect(workspace.locator('#urls')).toHaveValue('')
  expect(await worker.evaluate('chrome.storage.sync.get(null)')).toEqual({})
})

test('opens unique URLs in reverse order and Clear removes saved input', async ({
  workspace,
  extensionContext
}) => {
  const worker = extensionContext.serviceWorkers()[0]
  // Serve real destinations locally: Chromium's initial extension-created tab navigation
  // can happen before Playwright attaches request interception to the new tab.
  const server = createServer((_request, response) => {
    response.writeHead(200, { 'Content-Type': 'text/html' })
    response.end('<h1>Test destination</h1>')
  })
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  const origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
  try {
    await expect(workspace.getByRole('button', { name: 'Clear', exact: true })).toBeDisabled()
    await workspace.locator('#urls').fill(`${origin}/first\n${origin}/second\n${origin}/first`)
    await workspace.getByLabel('Order', { exact: true }).selectOption('reverse')
    await expect(workspace.locator('#open')).toContainText('(2)')
    await workspace.locator('#open').click()
    await expect(workspace.getByRole('status')).toContainText('Finished opening')
    await expect
      .poll(() =>
        extensionContext
          .pages()
          .map((page) => page.url())
          .filter((url) => url.startsWith(origin))
      )
      .toEqual([`${origin}/second`, `${origin}/first`])
    await workspace.getByRole('button', { name: 'Clear', exact: true }).click()
    await expect(workspace.locator('#urls')).toHaveValue('')
    await expect(workspace.locator('#urls')).toBeFocused()
    await expect(workspace.locator('#open')).toBeDisabled()
    await expect(workspace.getByRole('status')).toHaveCount(0)
    await expect.poll(() => worker.evaluate('chrome.storage.local.get("txt")')).toEqual({ txt: '' })
    await workspace.reload()
    await expect(workspace.locator('#urls')).toHaveValue('')
    await expect(workspace.getByLabel('Order', { exact: true })).toHaveValue('reverse')
    await expect(workspace.locator('#preserve')).toBeChecked()
    await expect(workspace.getByRole('button', { name: 'Clear', exact: true })).toBeDisabled()
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()))
      server.closeAllConnections()
    })
  }
})
